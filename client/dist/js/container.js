angular.module('container', ['configs']).controller('ConfigCtrl', [
  '$scope',
  'configs',
  function ($scope, configs) {
    $scope.configs = configs;
  }
]).controller('ContainerCtrl', [
  '$scope',
  'configs',
  function ($scope, configs) {
    $scope.isShowConstruction = true;
    $scope.hideConstruction = function () {
      $scope.isShowConstruction = false;
    };
    $scope.configs = configs;
  }
]);