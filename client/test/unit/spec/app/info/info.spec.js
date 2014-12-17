describe('info', function() {
  var $scope, configs, $controller, $httpBackend, $timeout, remote, appCollection;
  
  beforeEach(function (){
    module('info');
    
    inject(function($rootScope, _$controller_, _configs_, _$httpBackend_, _$timeout_, _remote_, _appCollection_) {
      $controller = _$controller_;
      $scope = $rootScope.$new();
      configs = _configs_;
      $httpBackend = _$httpBackend_;
      $timeout = _$timeout_;
      remote = _remote_;
      appCollection = _appCollection_;
    });
  });
  
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  
  describe("AppInfoCtrl", function() {
    var ctrl;
    
    var realData = {
      "ret": 0,
      "msg": "ok",
      "data": {
        "12": {
          "FAwardId": "12",
          "FUser": "116943915",
          "FTamsId": "",
          "FName": "相册",
          "FType": "Album",
          "FLotterId": "0",
          "FEnable": "0",
          "FStatus": "0",
          "FData": {
            "FType": "Album",
            "FName": "相册",
            "FTitle": "相册",
            "FId": "",
            "FKey": "",
            "FActivate": 0,
            "FAlbums": [{
              "FName": "滨海景观",
              "FDescription": "滨海景观描述",
              "FPictureSets": [
                {
                  "FName": "美丽沙滩",
                  "FPictures": []
                },
                {
                  "FName": "美丽天空",
                  "FPictures": []
                },
                {
                  "FName": "美丽水乡",
                  "FPictures": []
                },
                {
                  "FName": "美丽园林",
                  "FPictures": []
                }
              ]
            }]
          },
          "FUrl": "http:\/\/album.weiapp.qq.com\/albums\/12",
          "FValue1": "",
          "FCreateTime": "2014-05-07 17:20:00",
          "FUpdateTime": "2014-05-07 17:20:00",
          "FIp": "10.22.88.60",
          "FMemo": ""
        }
      }
    };

    var validResponse = {
      ret: 0,
      msg: "ok",
      data: {}
    };

    beforeEach(function(){
      $scope.appId = 12;

      ctrl = $controller('AppInfoCtrl', {
        $scope: $scope
      });

      // Should set appId again
      $scope.appId = 12;
      $scope.appCollection.requestData();
      $scope.mainForm = jasmine.createSpyObj('mainForm', ['$setValidity']);

      $httpBackend.expectPOST("/service/get_app_list").respond(realData);
      $httpBackend.flush();
    });

    it('should have editInfo after request data', function() {
      expect($scope.editInfo).not.toBe(null);
      expect(typeof $scope.editInfo).toBe("object");
    });

    it('should have an copyed data model', function() {
      expect($scope.editInfo == $scope.appCollection.apps[$scope.appId].FData).not.toBe(true);
    });

    it('should validate image urls', function() {
      expect($scope.mainForm.$setValidity).toHaveBeenCalledWith('setImages', true);
    });

    it('should be able to remove an item', function() {
      expect($scope.removeItem).toBeDefined();
    });

    it('should be able to add an album', function() {
      $scope.addSection();
      expect($scope.editInfo.FAlbums.length).toBe(2);
    });

    it('should should trigger canceled event after cancel', function() {
      inject(function($location) {
        // var spy = spyOn($location, 'path');
        var spy = spyOn($scope, '$emit');
        $scope.cancel();
        // expect(spy).toHaveBeenCalledWith('canceled');
        expect(spy).toHaveBeenCalledWith('canceled');
      });
    });

    it("should should trigger saved event after successfully saved", function() {
      var spy = spyOn($scope, '$emit');
      
      $httpBackend.expectPOST("/service/save_app").respond(validResponse);
      $httpBackend.expectGET("partials/modal.tpl.html").respond(validResponse);
      $httpBackend.expectPOST("/service/get_app_list").respond(realData);

      $scope.submit();

      $httpBackend.flush();
      expect(spy).toHaveBeenCalledWith('saved');
    });

    it('should be able to submit data and then sync editInfo with main model', function() {
      $httpBackend.expectPOST("/service/save_app").respond(validResponse);
      $httpBackend.expectGET("partials/modal.tpl.html").respond(validResponse);
      $httpBackend.expectPOST("/service/get_app_list").respond(realData);

      $scope.editInfo.FName = "zx";
      expect($scope.editInfo).not.toEqual($scope.appCollection.apps[$scope.appId].FData);

      $scope.submit();

      $httpBackend.flush();
      expect($scope.editInfo).not.toEqual($scope.appCollection.apps[$scope.appId].FData);

      inject(function($location) {
         var spy = spyOn($location, 'path');
         $timeout.flush();
         // expect(spy).toHaveBeenCalledWith('/');
      });
    });
  });
});
