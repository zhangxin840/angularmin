angular.module('crm', ['ngRoute', 'utils'])

.factory('crmData', function(remote, helpers) {
  var crmData = {};
  crmData.awards = null;
  crmData.pageInfo = null;

  crmData.requestData = function(searchObj){
    // Reset result before search
    crmData.awards = null;
    crmData.pageInfo = null;

    return remote.request("awardList", searchObj).then(function(data){
      crmData.awards = data.info;
      crmData.pageInfo = data.page_info;
    });
  };

  return crmData;
})

.controller('CrmCtrl', function ($scope, $routeParams, widgets, helpers, remote, crmData) {
  var search = function(isResetPage){
    if(isResetPage){
      $scope.searchObj.page = null;
    }
    crmData.requestData($scope.searchObj);
  };

  $scope.appId = $routeParams.appId;
  $scope.awards = null;

  // Watch for repoint
  $scope.crmData = crmData;
  $scope.$watch('crmData.awards', function(){
    $scope.awards = crmData.awards;
  }, false);
  $scope.$watch('crmData.pageInfo', function(){
    $scope.page = {
      totalItems: crmData.pageInfo? crmData.pageInfo.page_size * crmData.pageInfo.page_total : 0,
      currentPage: crmData.pageInfo? crmData.pageInfo.page_index : 0,
      maxSize: 5,
      itemsPerPage: crmData.pageInfo? crmData.pageInfo.page_size : 0
    };
  }, false);

  $scope.awardsInfo = [];
  $scope.awardsInfo.push({
    FAwardId: 0,
    FName: "一等奖"
  },{
    FAwardId: 1,
    FName: "二等奖"
  });

  $scope.exportUrl = "/service/export" + "?" + helpers.serializeParam({
      type: "fruit",
      Site_id: $scope.appId,
      g_tk: ""
    });

  $scope.columns = {
    FUserID: false,
    FRegQQ: true,
    FName: true,
    FAwardName: true,
    FMobile: true,
    FLottoTime: true,
    FAddr: true
  };

  $scope.searchObj = {
    app_id: $scope.appId,
    phone: null,
    name: null,
    award: null,
    page: null
  };

  // Paging settings
  $scope.page = {
    totalItems: 0,
    currentPage: 1,
    maxSize: 5,
    itemsPerPage: 0
  };

  $scope.search = search;

  $scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
  };

  $scope.pageChanged = function() {
    $scope.searchObj.page = $scope.page.currentPage;
    search();
  };

  $scope.showSelectColumn = function(){
    widgets.modal({
      templateUrl: 'partials/selectColumnModal.html',
      title: "������ʾ�ֶ�",
      isDialog: true,
      columns: $scope.columns
    }).then(function($modalScope){
    });
  };

  $scope.export = function(){
    remote.request("export", {
      type: "fruit",
      Site_id: $scope.appId,
      g_tk: ""
    }).then(function(data){
    });
  };

  // Request when init, should be moved into run recipes.
  search();
})

.run(function(remote){
  remote.addApi('awardList',{
    requestConfig: {
      method: 'GET',
      url: "service/award_list",
      params: {
        app_id: ""
      }
    }
  });

  remote.addApi('export',{
    requestConfig: {
      method: 'GET',
      url: "service/export",
      params: {
        type: "fruit",
        Site_id: "",
        g_tk: ""
      }
    }
  });
});