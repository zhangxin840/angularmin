angular.module('services.remote', ['base', 'ui.widgets', 'configs'])

.factory('remote', function ($http, $q, $rootScope, widgets, helpers, configs) {
  var remote = {};

  remote.apiConfigs = {
    "key": {
      requestConfig: {},
      isMockRequest: false,
      isMockData: false,
      mockData: {},
      description: ""
    }
  };

  remote.addApi = function(key, newApiConfig){
    remote.apiConfigs[key] = {};
    // Add base url
    newApiConfig.requestConfig.url = configs.remoteBase + newApiConfig.requestConfig.url;
    helpers.deepExtend(remote.apiConfigs[key], newApiConfig);
  };

  var requestRemote = function(key, data){
    var requestConfig = helpers.deepExtend({}, remote.apiConfigs[key].requestConfig);
    var deferred = $q.defer();

    // Append request data
    helpers.deepExtend(data, configs.appendRequest);

    // Pass data as params when method is get
    requestConfig.method = requestConfig.method || "GET";
    if(requestConfig.method.toUpperCase() === "GET"){
      if(!requestConfig.params){
        requestConfig.params = helpers.deepExtend({}, requestConfig.data);
      }
      helpers.deepExtend(requestConfig.params, data);
    }
    else{
      requestConfig.data  = requestConfig.data || {};
      helpers.deepExtend(requestConfig.data, data);
    }

    if((configs.isMockData || remote.apiConfigs[key].isMockData) && configs.isDevMode){
      // Point to mock backend data
      requestConfig.method = "GET";
      requestConfig.url = configs.mockPath + key + ".json";
    }

    // Make request
    $http(requestConfig).success(function(data, status, headers, config) {
      var errorMessage = "";

      if (data.ret === 0 || data.code === 0 || data.errorcode === 0) {
        deferred.resolve(data.data);
      } else {
        if(configs.isDevMode){
          errorMessage += requestConfig.url + " 接口异常";
          errorMessage += ' ';
          errorMessage += "服务器消息：" + (data.msg || data.errmsg);
        }else{
          errorMessage += "提示：" + (data.msg || data.errmsg);
        }

        deferred.reject(config);
        widgets.confirm(errorMessage);
      }
    }).error(function(data, status, headers, config) {
      deferred.reject(config);
      widgets.confirm(config.method + " " + config.url + " " + "连接失败 " + status);
    });

    return deferred.promise;
  };

  remote.request = function(key, data){
    var deferred = $q.defer();
    var promise;

    if((configs.isMockRequest || remote.apiConfigs[key].isMockRequest) && configs.isDevMode){
      deferred.resolve(remote.apiConfigs[key].mockData);
      promise = deferred.promise;
    }
    else{
      promise = requestRemote(key, data);
    }

    $rootScope.requestPromise = promise;

    return promise;
  };

  return remote;
});
