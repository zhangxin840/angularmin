describe("list", function() {
  var module;
  module = angular.module("list");

  it("should be registered", function() {
    expect(module).not.toBe(null);
  });

  describe("Dependencies", function() {

    var deps;
    beforeEach(function() {
      deps = module.value('appName').requires;
    });

    var hasModule = function(m) {
      return deps.indexOf(m) >= 0;
    };

    //you can also test the module's dependencies
    it("should have ngRoute as a dependency", function() {
      expect(hasModule('ngRoute')).toBe(true);
    });
  });
});



describe("AppList Factorys", function() {

  beforeEach(module('list'));

  it('should contain an appCollection factory',
    inject(function(appCollection) {
      expect(appCollection).not.toBe(null);
    })
  );

  describe("appCollection", function() {
    var appCollection;
    var remote;

    beforeEach(function() {
      inject(function(_appCollection_, _remote_, configs){
        appCollection = _appCollection_;
        remote = _remote_;

        configs.isDevMode = false;
      });
    });

    it("should have a requestData method", function() {
      expect(typeof appCollection.requestData).toBe("function");
    });

    it("should return a promise after request data", function() {
      expect(typeof appCollection.requestData().then).toBe("function");
    });

    it("should be able to request data from backend", function() {
      var realData = {
        ret: 0,
        msg: "ok",
        data: {
          realData: true
        }
      };

      var $httpBackend;

      inject(function( _$httpBackend_){
        $httpBackend = _$httpBackend_;
      });

      appCollection.requestData();

      $httpBackend.expectPOST("/service/get_app_list").respond(realData);
  
      $httpBackend.flush();
      expect(appCollection.apps).toEqual(realData.data);

      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });
});


describe("AppList Filters", function() {
  var $filter;

  beforeEach(function(){
    module('list');

    inject(function(_$filter_) {
      $filter = _$filter_;
    });
  });

  it('should contain an auditStatusText filter', function() {
    expect($filter("auditStatusText")).not.toBe(null);
  });

  describe("auditStatusText", function() {
    it("should status code to text", function() {
      expect($filter("auditStatusText")("0")).toBe("编辑中");
      expect($filter("auditStatusText")("1")).toBe("待审核");
      expect($filter("auditStatusText")(2)).toBe("审核通过");
      expect($filter("auditStatusText")(3)).toBe("未通过审核");
      expect($filter("auditStatusText")(5)).toBe("未知");
    });
  });
});


describe('AppList Controllers', function() {
  var $scope, configs, $controller, $httpBackend, $timeout, remote;
  
  beforeEach(function (){
    module('list');
    
    inject(function($rootScope, _$controller_, _configs_, _$httpBackend_, _$timeout_, _remote_) {
      $controller = _$controller_;
      $scope = $rootScope.$new();
      configs = configs;
      $httpBackend = _$httpBackend_;
      $timeout = _$timeout_;
      remote = _remote_;
    });
  });
  
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  
  describe("AppListCtrl", function() {
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
      ctrl = $controller('AppListCtrl', {
        $scope: $scope
      });

      $scope.appCollection.requestData();
      
      $httpBackend.expectPOST("/service/get_app_list").respond(realData);
      $httpBackend.flush();
    });
    
    it('should have a app list after request data', function() {
    	expect(typeof $scope.apps[0].FData).toBe("object");
	});
    
    it('should be able to add an act', function() {
    	$httpBackend.expectPOST("/service/create_app").respond(validResponse);
    	$httpBackend.expectGET("partials/modal.tpl.html").respond(validResponse);
      $httpBackend.expectPOST("/service/get_app_list").respond(realData);
    	
    	$scope.addAct();
    	
    	$httpBackend.flush();
    	expect(typeof $scope.apps[0].FData).toBe("object");
	});
    
    it('should be able to delete an act', function() {
    	$httpBackend.expectGET("partials/modal.tpl.html").respond(validResponse);
 
    	$scope.deleteAct();
    	
    	$httpBackend.flush();
    	expect(typeof $scope.apps[0].FData).toBe("object");
	});
    
    it('should be able to submit audit', function() {
    	$httpBackend.expectPOST("/service/audit").respond(validResponse);
    	$httpBackend.expectGET("partials/modal.tpl.html").respond(validResponse);
    	$httpBackend.expectPOST("/service/get_app_list").respond(realData);
 
    	$scope.auditAct();
    	
    	$httpBackend.flush();
    	expect(typeof $scope.apps[0].FData).toBe("object");
	});
  });
});
