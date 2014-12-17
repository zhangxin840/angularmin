angular.module('services.remote', [
  'base',
  'ui.widgets',
  'configs'
]).factory('remote', [
  '$http',
  '$q',
  '$rootScope',
  'widgets',
  'helpers',
  'configs',
  function ($http, $q, $rootScope, widgets, helpers, configs) {
    var remote = {};
    remote.apiConfigs = {
      'key': {
        requestConfig: {},
        isMockRequest: false,
        isMockData: false,
        mockData: {},
        description: ''
      }
    };
    remote.addApi = function (key, newApiConfig) {
      remote.apiConfigs[key] = {};
      // Add base url
      newApiConfig.requestConfig.url = configs.remoteBase + newApiConfig.requestConfig.url;
      helpers.deepExtend(remote.apiConfigs[key], newApiConfig);
    };
    var requestRemote = function (key, data) {
      var requestConfig = helpers.deepExtend({}, remote.apiConfigs[key].requestConfig);
      var deferred = $q.defer();
      // Append request data
      helpers.deepExtend(data, configs.appendRequest);
      // Pass data as params when method in get
      requestConfig.method = requestConfig.method || 'GET';
      if (requestConfig.method.toUpperCase() === 'GET') {
        helpers.deepExtend(requestConfig.params, data);
      } else {
        requestConfig.data = requestConfig.data || {};
        helpers.deepExtend(requestConfig.data, data);
      }
      if ((configs.isMockData || remote.apiConfigs[key].isMockData) && configs.isDevMode) {
        // Point to mock backend data
        requestConfig.method = 'GET';
        requestConfig.url = configs.mockPath + key + '.json';
      }
      // Make request
      $http(requestConfig).success(function (data, status, headers, config) {
        var errorMessage = '';
        if (data.ret === 0 || data.code === 0) {
          deferred.resolve(data.data);
        } else {
          if (configs.isDevMode) {
            errorMessage += requestConfig.url + ' \u63a5\u53e3\u5f02\u5e38';
            errorMessage += ' ';
            errorMessage += '\u670d\u52a1\u5668\u6d88\u606f\uff1a' + data.msg;
          } else {
            errorMessage += '\u63d0\u793a\uff1a' + data.msg;
          }
          deferred.reject(config);
          widgets.confirm(errorMessage);
        }
      }).error(function (data, status, headers, config) {
        deferred.reject(config);
        widgets.confirm(config.method + ' ' + config.url + ' ' + '\u8fde\u63a5\u5931\u8d25 ' + status);
      });
      return deferred.promise;
    };
    remote.request = function (key, data) {
      var deferred = $q.defer();
      var promise;
      if ((configs.isMockRequest || remote.apiConfigs[key].isMockRequest) && configs.isDevMode) {
        deferred.resolve(remote.apiConfigs[key].mockData);
        promise = deferred.promise;
      } else {
        promise = requestRemote(key, data);
      }
      $rootScope.requestPromise = promise;
      return promise;
    };
    return remote;
  }
]);