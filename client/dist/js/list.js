angular.module('list', [
  'ngRoute',
  'utils'
]).factory('appCollection', [
  'remote',
  'helpers',
  function (remote, helpers) {
    var appCollection = {};
    appCollection.apps = null;
    appCollection.requestData = function () {
      return remote.request('appList', {}).then(function (data) {
        if (helpers.objectSize(data) > 0) {
          // Repoint to new object
          appCollection.apps = data;
        }
      });
    };
    return appCollection;
  }
]).filter('auditStatusText', function () {
  return function (input) {
    var result = '';
    var authStatus = +input;
    if (authStatus === 0) {
      result = '\u7f16\u8f91\u4e2d';
    } else if (authStatus === 1) {
      result = '\u5f85\u5ba1\u6838';
    } else if (authStatus === 2) {
      result = '\u5ba1\u6838\u901a\u8fc7';
    } else if (authStatus === 3) {
      result = '\u672a\u901a\u8fc7\u5ba1\u6838';
    } else {
      result = '\u672a\u77e5';
    }
    return result;
  };
}).controller('AppListCtrl', [
  '$scope',
  'widgets',
  'helpers',
  'remote',
  'appCollection',
  '$location',
  function ($scope, widgets, helpers, remote, appCollection, $location) {
    $scope.apps = null;
    // Point to factory, watch for data
    $scope.appCollection = appCollection;
    $scope.$watch('appCollection.apps', function () {
      // Build collection
      if (appCollection.apps) {
        $scope.apps = [];
        for (var id in appCollection.apps) {
          // Insert id property
          appCollection.apps[id].id = id;
          $scope.apps.push(appCollection.apps[id]);
        }
      }
    }, false);
    $scope.addAct = function () {
      remote.request('createApp', {}).then(function (data) {
        widgets.notify('\u521b\u5efa\u6210\u529f');
        $location.path('/edit/' + data.app_id);
        appCollection.requestData();
      });
    };
    $scope.deleteAct = function (appId) {
      widgets.dialog('\u786e\u8ba4\u5220\u9664\u8be5\u6d3b\u52a8\uff1f\u5220\u9664\u540e\u4e0d\u53ef\u6062\u590d').then(function () {
        remote.request('deleteApp', { app_id: appId }).then(function (data) {
          widgets.notify('\u5220\u9664\u6210\u529f');
          // Remove in factory and collection
          $scope.apps.splice($scope.apps.indexOf(appCollection.apps[appId]), 1);
          delete appCollection.apps[appId];
        });
      });
    };
    $scope.auditAct = function (appId) {
      remote.request('auditApp', { app_id: appId }).then(function (data) {
        widgets.notify('\u5df2\u63d0\u4ea4\u5ba1\u6838');
        appCollection.requestData();
      });
    };
  }
]).run([
  'remote',
  function (remote) {
    remote.addApi('appList', {
      requestConfig: {
        method: 'POST',
        url: 'service/get_app_list',
        data: { type: 'fruit' }
      },
      isMockData: false
    });
    remote.addApi('createApp', {
      requestConfig: {
        method: 'POST',
        url: 'service/create_app',
        data: {
          type: 'fruit',
          g_tk: ''
        }
      }
    });
    remote.addApi('deleteApp', {
      requestConfig: {
        method: 'POST',
        url: 'service/del_app',
        data: {
          app_id: '',
          g_tk: ''
        }
      }
    });
    remote.addApi('auditApp', {
      requestConfig: {
        method: 'POST',
        url: 'service/audit',
        data: { app_id: '' }
      }
    });
  }
]);