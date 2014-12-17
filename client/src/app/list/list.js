angular.module('list', ['ngRoute', 'utils'])

.factory('appCollection', function(remote, helpers) {
  var appCollection = {};
  appCollection.apps = null;

  appCollection.requestData = function(){
    return remote.request("appList", {}).then(function(data){
      if(helpers.objectSize(data) > 0){
        // Repoint to new object
        appCollection.apps = data;
      }
    });
  };

  return appCollection;
})

.filter('auditStatusText', function() {
  return function(input) {
    var result = "";
    var authStatus = +(input);

    if(authStatus === 0){
      result = ('编辑中');
    }else if(authStatus === 1){
      result = ('待审核');
    }else if(authStatus === 2){
      result = ('审核通过');
    }else if(authStatus === 3){
      result = ('未通过审核');
    }else{
      result = ('未知');
    }
    
    return result;
  };
})

.controller('AppListCtrl', function ($scope, widgets, helpers, remote, appCollection, $location) {
  $scope.apps = null;

  // Point to factory, watch for data
  $scope.appCollection = appCollection;
  $scope.$watch('appCollection.apps', function(){
    // Build collection
    if(appCollection.apps){
      $scope.apps = [];
      for(var id in appCollection.apps){
        // Insert id property
        appCollection.apps[id].id = id;
        $scope.apps.push(appCollection.apps[id]);
      }
    }
  }, false);

  $scope.addAct = function(){
    remote.request("createApp", {}).then(function(data){
      widgets.notify("创建成功");
      $location.path("/edit/" + data.app_id);
      appCollection.requestData();
    });
  };

  $scope.deleteAct = function(appId){
    widgets.dialog("确认删除该活动？删除后不可恢复")
      .then(function(){
        remote.request("deleteApp", {
          app_id: appId
        }).then(function(data){
          widgets.notify("删除成功");
          
          // Remove in factory and collection
          $scope.apps.splice($scope.apps.indexOf(appCollection.apps[appId]), 1);
          delete appCollection.apps[appId];
        });
      });
  };

  $scope.auditAct = function(appId){
    remote.request("auditApp", {
      app_id: appId
    }).then(function(data){
      widgets.notify("已提交审核");
      appCollection.requestData();
    });
  };
})

.run(function(remote){
  remote.addApi('appList', {
    requestConfig: {
      method: 'POST',
      url: "service/get_app_list",
      data: {
        type: "fruit"
      }
    },
    isMockData: false
  });

  remote.addApi('createApp', {
    requestConfig: {
      method: 'POST',
      url: "service/create_app",
      data: {
        type: "fruit",
        g_tk: ""
      }
    }
  });

  remote.addApi('deleteApp', {
    requestConfig: {
      method: 'POST',
      url: "service/del_app",
      data: {
        app_id: "",
        g_tk: ""
      }
    }
  });

  remote.addApi('auditApp', {
    requestConfig: {
      method: 'POST',
      url: "service/audit",
      data: {
        app_id: ""
      }
    }
  });
});