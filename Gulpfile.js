'use strict';
var gulp = require('gulp'),
    jscs = require('gulp-jscs'),
    args = require('yargs').argv,
    clean = require('gulp-clean'),
    gutil = require('gulp-util'),
    mocha = require('gulp-mocha'),
    clean = require('gulp-clean'),
    jshint = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish'),
    complexity = require('gulp-complexity'),
    ngHtml2Js = require('gulp-ng-html2js'),
    filter = require('gulp-filter'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    less = require('gulp-less'),
    minifyCSS = require('gulp-minify-css'),
    replace = require('gulp-replace'),
    connect = require('gulp-connect'),
    open = require('gulp-open'),
    e2e = args.e2e,
    prod = args.prod,
    dev = args.dev || !prod,
    pkg = require('./package.json');

/**
 * Paths
 */

var paths = {
  dest: 'dev'
};

/**
 * Filters
 */

var srcNoTestsFilter = filter('!**/*.spec.js');

/**
 * Handlers
 */

var errorHandler = function (err) { 
  gutil.beep();
  this.emit('end');
};

/**
 * Tests
 */

gulp.task('test', function () {
  return gulp.src('test/**/*.spec.js')
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jscs())
    .pipe(mocha({reporter: 'spec'}))
    .on('error', errorHandler);

});


gulp.task('clean', function () {
  return gulp.src(paths.dest + '/*', {read: false})
    .pipe(clean());
});

/**
 * Scripts
 */

gulp.task('scripts', ['ngtemplates'], function () {
  return gulp.src(['src/**/*.js', '.tmp/template.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jscs())
    .pipe(srcNoTestsFilter)
    .pipe(prod ? complexity() : gutil.noop())
    .on('error', errorHandler)
    .pipe(concat(pkg.name + '.js'))
    .pipe(gulp.dest(paths.dest + '/release/'))
    .pipe(rename(pkg.name + '.min.js'))
    .pipe(uglify(/*{outSourceMap: true}*/))
    .pipe(gulp.dest(paths.dest + '/release/'))
    .pipe(connect.reload());
});

/**
 * Scripts
 */

gulp.task('styles', function () {
  return gulp.src(['src/less/main.less', 'src/features/**/less/**/*.less'])
    .pipe(less({cleanCSS:true}))
    .pipe(concat(pkg.name + '.css'))
    .pipe(gulp.dest(paths.dest + '/release/'))
    .pipe(rename(pkg.name + '.min.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest(paths.dest + '/release/'))
    .pipe(connect.reload());
});

/**
 * Templates
 */

gulp.task('ngtemplates', function () {
  return gulp.src(['src/templates/**/*.html', 'src/features/*/templates/**/*.html'])
    .pipe(ngHtml2Js({
        moduleName: 'ui.grid',
        rename: function (url) {
          // Remove the src/templates/ prefix
          url = url.replace(/^src\/templates\//, '');

          // Replace feature prefix with just 'ui-grid'
          url = url.replace(/^src\/features\/[^\/]+?\/templates/, 'ui-grid');

          // Remove the .html extension
          return url.replace('.html', '');
        }
      }))
    .pipe(gulp.dest('.tmp'));
});


/**
 * Copy
 */


gulp.task('copy', function () {
  return gulp.src('misc/demo/*')
    .pipe(replace(/\/dist\//g, ''))
    .pipe(gulp.dest(paths.dest))
    .pipe(connect.reload());
});

/**
 * Connect
 */

gulp.task('connect', ['build'], function () {
  connect.server({
    root: ['.'],
    port: 1337,
    livereload: true
  })
});

/**
 * Open
 */

gulp.task('open', ['connect', 'copy'], function () {
  return gulp.src('./dev/grid-directive.html')
  .pipe(open('', {
    url: 'http://localhost:1337/dev/grid-directive.html'
  }));
});

/**
 * Watch
 */

gulp.task('watch', ['connect'], function () {
  gulp.watch(['src/**/*.js', '.tmp/templates.js'], ['scripts']);
  gulp.watch(['src/less/*.less', 'src/features/**/less/**/*.less'], ['styles']);
  gulp.watch('misc/demo/*.html', ['copy']);
  gulp.watch(['src/templates/**/*.html', 'src/features/*/templates/**/*.html'], ['ngtemplates']);
});


/**
 * Super Tasks
 */

gulp.task('build', ['clean', 'ngtemplates', 'scripts',/* 'fontello', */ 'styles', 'copy', /*'ngdocs'*/]);
gulp.task('dev', ['connect', 'build', 'open', 'watch']);

gulp.task('dev-test', ['jshint-all', 'test'], function () {
  gulp.watch('./{lib,script,test}/**/*.js', ['jshint-all', 'test']);
});


gulp.task('ci', ['jshint-all', 'test', 'complexity', 'coverage']);
gulp.task('default', ['jshint-all', 'test', 'complexity']);
