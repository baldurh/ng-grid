(function () {
  'use strict';
  var module = angular.module('ui.grid.sidebar', ['ui.grid']);

  // module.directive('uiGridSidebar', ['$log',
  //   function ($log) {
  //     return {
  //       replace: true,
  //       priority: -150,
  //       require: '^uiGrid',
  //       scope: false,
  //       compile: function () {
  //         return {
  //           pre: function ($scope, $elm, $attrs, uiGridCtrl) {
  //             $log.debug(uiGridCtrl);
  //           },
  //           post: function ($scope, $elm, $attrs, uiGridCtrl) {
  //             // $log.debug(uiGridCtrl);
  //           }
  //         };
  //       }
  //     };
  //   }]);

  module.directive('uiGridRow', ['$compile', '$log',
    function ($compile, $log) {
      return {
        priority: -10, // run after default uiGridRow directive
        require: '^uiGrid',
        // scope: false,
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
              var resizerLeft = angular.element('<div class="num-col">');
              $elm.parent().prepend(resizerLeft);
              $compile(resizerLeft)($scope);
            }
          };
        }
      };
    }]);

  module.directive('uiGridHeader', ['$compile', '$log',
    function ($compile, $log) {
      return {
        priority: -10, // run after default uiGridRow directive
        require: '^uiGrid',
        // scope: false,
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
              $log.debug($elm);
              $log.debug($scope);
              $scope.$watch($elm, function(){
                $log.debug(this.exp);
                angular.forEach(this.exp.find('div'), function(elm) {
                  elm = angular.element(elm);
                  if (elm.hasClass('ui-grid-header-canvas')) {
                    var resizerLeft = angular.element('<div class="num-col">');
                    elm.prepend(resizerLeft);
                    $compile(resizerLeft)($scope);
                  }
                });
              });
            }
          };
        }
      };
    }]);

})();

