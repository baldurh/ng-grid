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
    e2e = args.e2e,
    prod = args.prod,
    dev = args.dev || !prod,
    pkg = require('./package.json');

/**
 * Paths
 */

var paths = {
  dist: 'dist2'
}

/**
 * Filters
 */

var srcTestsFilter = filter('!src/**/test/*');

/**
 * Handlers
 */

var mochaErrorHandler = function (err) { 
  gutil.beep();
  this.emit('end');
};

/**
 * Tests
 */

gulp.task('test', function (cb) {
  gulp.src('test/**/*.spec.js')
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jscs())
    .pipe(mocha({reporter: 'spec'}))
    .on('error', mochaErrorHandler);
  cb();
});


gulp.task('clean', function (cb) {
  return gulp.src([paths.dist], {read: false})
    .pipe(clean());
});

/**
 * Scripts
 */

gulp.task('scripts', function (cb) {
  gulp.src(['src/**/*.js', 'Gulpfile.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jscs())
    .pipe(srcTestsFilter)
    .pipe(dev ? complexity() : gutil.noop())
    .pipe(srcTestsFilter.restore())
    .pipe(concat('all.js'))
    .pipe(gulp.dest(paths.dist + '/release/' + pkg.name + '.js'))
    .pipe(uglify({outSourceMap: true}))
    .pipe(gulp.dest(paths.dist + '/release/' + pkg.name + '.min.js'));
  cb();
});

/**
 * Templates
 */

gulp.task('ngtemplates', function () {
  gulp.src(['src/templates/**/*.html', 'src/features/*/templates/**/*.html'])
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

gulp.task('build', ['clean', 'ngtemplates', 'scripts',/* 'fontello', 'less', 'ngdocs', 'copy'*/])

/**
 * Super Tasks
 */

gulp.task('dev', ['clean', 'code-inspection', 'ngtemplates'], function () {
  gulp.watch('./{lib,script}/**/*.js', ['jshint']);
});

gulp.task('dev-test', ['jshint-all', 'test'], function () {
  gulp.watch('./{lib,script,test}/**/*.js', ['jshint-all', 'test']);
});


gulp.task('ci', ['jshint-all', 'test', 'complexity', 'coverage']);
gulp.task('default', ['jshint-all', 'test', 'complexity']);
