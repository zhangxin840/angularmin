describe('container', function() {
  var $scope, configs, $controller;

  beforeEach(function (){
    module('container');

    inject(function($rootScope, _$controller_, _configs_) {
      $controller = _$controller_;
      $scope = $rootScope.$new();
      configs = configs;
    });
  });

  describe("ContainerCtrl", function() {
    var ctrl;
    beforeEach(function(){
      ctrl = $controller('ContainerCtrl', {
        $scope: $scope
      });
    });

    it('should start with theme and isShowConstruction populated', function() {
      expect($scope.configs.theme).toBeTruthy();
      expect($scope.isShowConstruction).toBeTruthy();
    });


    it('should hide construction when called hideConstruction', function (){
      $scope.hideConstruction();
      expect($scope.isShowConstruction).toBeFalsy();
    });
  });
});