angular.module('info', ['ngRoute', 'utils', 'list'])

.controller('AppInfoCtrl', function ($scope, $routeParams, $timeout, $location, widgets, helpers, remote, appCollection, configs) {
  $scope.appId = $routeParams.appId;
  $scope.editInfo = null;

  // Can only watch objects in scope
  $scope.appCollection = appCollection;
  $scope.$watch('appCollection.apps', function(){
    if($scope.appCollection.apps &&
      $scope.appCollection.apps[$scope.appId] &&
      $scope.appCollection.apps[$scope.appId].FData){
      
      $scope.editInfo = {};
      // Edit form has a deep copied model
      helpers.deepExtend($scope.editInfo, $scope.appCollection.apps[$scope.appId].FData);
    }
  }, false);

  // Custom validation
  $scope.$watch('editInfo.FAlbums', function(){
    if(!$scope.editInfo){
      return;
    }

    var checkPictureSet = function(album){
      var result = true;
      var pictureSet;

      for(var key in album.FPictureSets){
        pictureSet = album.FPictureSets[key];
        pictureSet.isImagesValid = true;
        if(!pictureSet.FPictures || (pictureSet.FPictures.length < 1 || pictureSet.FPictures.length > 10)){
          pictureSet.isImagesValid = false;
          result = false;
        }
      }

      return result;
    };

    $scope.mainForm.$setValidity('setImages', true);

    for(var key in $scope.editInfo.FAlbums){
      if(!checkPictureSet($scope.editInfo.FAlbums[key])){
        $scope.mainForm.$setValidity('setImages', false);
        break;
      }
    }
  }, true);

  $scope.onUploadSuccess = function(childScope, file, data){
    childScope.pictureSet.FPictures.push(data.store_url);
  };

  $scope.removeItem = helpers.removeItem;

  var defaultSection = {
    "FName": "相册名称",
    "FDescription" : "相册描述",
    "FPictureSets": [{
      "FName": "图片集名称",
      "FPictures": ["http:\/\/appmedia.qq.com\/media\/flalbum\/11.jpg"]
    },{
      "FName": "图片集名称",
      "FPictures": ["http:\/\/appmedia.qq.com\/media\/flalbum\/12.jpg"]
    },{
      "FName": "图片集名称",
      "FPictures": ["http:\/\/appmedia.qq.com\/media\/flalbum\/13.jpg"]
    },{
      "FName": "图片集名称",
      "FPictures": ["http:\/\/appmedia.qq.com\/media\/flalbum\/14.jpg"]
    }]
  };

  var defaultSet = {
    "FName": "图片集名称",
    "FPictures": ["http:\/\/appmedia.qq.com\/media\/flalbum\/11.jpg"]
  };

  $scope.addSection = function(){
    if ($scope.editInfo.FAlbums.length < 10) {
      // Deep copy default data to prevent duplication in collection
      $scope.editInfo.FAlbums.push(helpers.deepExtend({},defaultSection));
    }
  };

  $scope.addSet = function(album){
    if (album.FPictureSets.length < 6) {
      // Deep copy default data to prevent duplication in collection
      album.FPictureSets.push(helpers.deepExtend({},defaultSet));
    }
  };

  $scope.cancel = function(){
    // Fire custom event
    $scope.$emit('canceled');
  };

  $scope.submit = function(){
    if($scope.mainForm && $scope.mainForm.$invalid){
      widgets.confirm("正确填写信息后才可以保存");
    }else{
      remote.request("saveApp", {
        data: $scope.editInfo,
        app_id: $scope.appId
      }).then(function(data){
        angular.copy($scope.editInfo, $scope.appCollection.apps[$scope.appId].FData);
        widgets.notify("保存成功");

        // Reload data
        appCollection.requestData();

        // Fire custom event
        $scope.$emit('saved');
      });
    }
  };
})

.run(function(remote){
    // For appInfo
    remote.addApi('loadApp', {
      requestConfig: {
        method: 'POST',
        url: "service/load_app",
        data: {
          app_id: "",
          type: "fruit"
        }
      }
    });

    remote.addApi('saveApp', {
      requestConfig: {
        method: 'POST',
        url: "service/save_app",
        data: {
          app_id: "",
          type: "fruit",
          g_tk: "",
          data: {}
        }
      }
    });
});