describe("services.remote", function() {
  var remote;
  var apiConfig;

  beforeEach(function(){
    module("services.remote");

    inject(function(_remote_) {
      remote = _remote_;
    });

    apiConfig = {
      requestConfig: {
        method: 'POST',
        url: "service/create_app",
        data: {
          type: "fruit",
          g_tk: ""
        },
      },
      mockData: {
        mock: true
      }
    };
  });

  it('should have an addApi method', function() {
    expect(remote.addApi).not.toBe(null);
  });

  it('should have a request method', function() {
    expect(remote.request).not.toBe(null);
  });

  describe("addApi", function() {
    it("should register api config with deep copy", function() {
      remote.addApi('createApp', apiConfig);
      var isSameObject = (remote.apiConfigs.createApp == apiConfig);

      expect(isSameObject).toBeFalsy();
      expect(remote.apiConfigs.createApp.requestConfig.data.type).toBe("fruit");
    });
  });

  describe("request", function() {
    var configs;
    var $timeout;
    var $httpBackend;

    beforeEach(function(){
      inject(function(_configs_, _$timeout_, _$httpBackend_){
        configs = _configs_;
        $timeout = _$timeout_;
        $httpBackend = _$httpBackend_;
      });

      remote.addApi('createApp', apiConfig);
    });


    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });


    describe("in dev mode", function() {
      beforeEach(function(){
        configs.isDevMode = true;
      });

      describe("in mock request mode", function() {
        beforeEach(function(){
          configs.isMockRequest = true;
        });

        it("should make fake request useing configed data", function() {
          var request;

          remote.request('createApp').then(function(data){
            result = data;
          });

          $timeout.flush();
          expect(result).toEqual(apiConfig.mockData);
        });
      });

      describe("in mock data mode", function() {
        beforeEach(function(){
          configs.isMockRequest = false;
          configs.isMockData = true;
        });

        it("should make request to static JSON in backend", function() {
          var result;
          var requestUrl = configs.mockPath + "createApp" + ".json";

          var mockBackendData = {
            ret: 0,
            msg: "ok",
            data: {
              mockBackendData: true
            }
          };

          $httpBackend.expectGET(requestUrl).respond(mockBackendData);
          // For model
          // $httpBackend.expectGET("partials/modal.html").respond();

          remote.request('createApp').then(function(data){
            result = data;
          });

          $httpBackend.flush();
          expect(result).toEqual(mockBackendData.data);
        });
      });
    });

    describe("in real mode", function() {
      beforeEach(function(){
        configs.isDevMode = false;
        configs.isMockRequest = true;
        configs.isMockData = true;
      });

      it("should make request to real backend", function() {
        var result;

        var realData = {
          ret: 0,
          msg: "ok",
          data: {
            realData: true
          }
        };

        $httpBackend.expectPOST(apiConfig.requestConfig.url).respond(realData);

        remote.request('createApp').then(function(data){
          result = data;
        });

        $httpBackend.flush();
        expect(result).toEqual(realData.data);
      });
    });

  });
});