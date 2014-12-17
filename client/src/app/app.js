angular.module('flApps', ['utils', 'info', 'list', 'crm'])

.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    controller:'AppListCtrl',
    templateUrl:'partials/list.tpl.html'
  })
  .when('/edit/:appId', {
    controller:'AppInfoCtrl',
    templateUrl:'partials/info.tpl.html'
  })
  .when('/crm/:appId', {
    controller:'CrmCtrl',
    templateUrl:'partials/crm.tpl.html'
  })
  .otherwise({
    redirectTo:'/'
  });
})

.run(function(appCollection, configs, helpers, remote, $rootScope, $timeout, $location){
  configs.isDevMode = false;

  if(configs.isInframe){
    configs.isBackToList = false;
    configs.theme += " wide";
  }

  // Compatibility for weiapp.qq.com
  if(configs.isInframe && configs.container === "http://weiapp.qq.com"){
    configs.isBackToList = true;
    configs.theme += " alignLeft";
  }

  // Compatibility for zhan.qq.com
  // Set authentication data to append to AJAX requests
  helpers.deepExtend(configs.appendRequest, configs.outerConfigs.flGrade);
  // Append location, backend will parse the info they want
  helpers.deepExtend(configs.appendRequest, {
    location: window.location.href
  });

  var triggerTopEvent = function(){
    // If in iFrame
    if(configs.isInframe && window.top.$){
      // Trigger event in top window
      window.top.$(window.top).trigger('appAdminSaved', {});
    }
  };

  $rootScope.$on('saved', function(event, data) {
    try {
      triggerTopEvent();
    }
    catch(err) {}
    finally{
      if(configs.isBackToList){
        $timeout(function(){
          $location.path("/");
        }, 2000);
      }
    }
  });

  $rootScope.$on('canceled', function(event, data) {
    try {
      triggerTopEvent();
    }
    catch(err) {}
    finally{
      if(configs.isBackToList){
        $location.path("/");
      }
    }
  });

  appCollection.requestData();
});


