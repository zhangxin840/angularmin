angular.module('container', ['configs'])

.controller('ConfigCtrl', function($scope, configs){
  $scope.configs = configs;
})

.controller('ContainerCtrl', function($scope, configs){
  $scope.isShowConstruction = true;

  $scope.hideConstruction = function(){
    $scope.isShowConstruction = false;
  };

  $scope.configs = configs;
});
