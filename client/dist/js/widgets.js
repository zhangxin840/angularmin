angular.module('ui.widgets', [
  'ui.bootstrap',
  'configs'
]).factory('widgets', [
  'configs',
  '$http',
  '$modal',
  '$rootScope',
  '$q',
  '$timeout',
  function (configs, $http, $modal, $rootScope, $q, $timeout) {
    var widgets = {};
    var modalCtrl = function ($scope, $modalInstance, modalConfigs) {
      angular.extend($scope, modalConfigs);
      $scope.ok = function () {
        $modalInstance.close('');
        if ($scope.deferred) {
          $scope.deferred.resolve();
        }
      };
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        if ($scope.deferred) {
          $scope.deferred.reject();
        }
      };
    };
    var openModal = function (modalConfigs) {
      var deferred = $q.defer();
      modalConfigs.deferred = deferred;
      modalConfigs.title = modalConfigs.title || '\u63d0\u793a';
      var modalInstance = $modal.open({
          templateUrl: 'partials/modal.tpl.html',
          controller: modalCtrl,
          resolve: {
            modalConfigs: function () {
              return modalConfigs;
            }
          }
        });
      if (modalConfigs.isNotify) {
        $timeout(function () {
          modalInstance.close('');
          deferred.reject();
        }, 1500);
      }
      return deferred.promise;
    };
    widgets.dialog = function (content, title) {
      var modalConfigs = {
          title: title,
          content: content,
          isDialog: true
        };
      return openModal(modalConfigs);
    };
    widgets.confirm = function (content, title) {
      var modalConfigs = {
          title: title,
          content: content,
          isConfirm: true
        };
      return openModal(modalConfigs);
    };
    widgets.notify = function (content, title) {
      var modalConfigs = {
          title: title,
          content: content,
          isNotify: true
        };
      return openModal(modalConfigs);
    };
    return widgets;
  }
]);