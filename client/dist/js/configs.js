angular.module('configs', []).factory('configs', function () {
  var configs = {};
  // Set false to disable all mocks
  configs.isDevMode = true;
  // Data mocking settings, works in dev mode
  // Resolve request with configed data
  configs.isMockRequest = false;
  // Request to static json files on backend
  configs.isMockData = false;
  // Path of mock data on backend
  configs.mockPath = 'mocks/';
  // Request url base
  configs.remoteBase = '/';
  // Data to append to all AJAX requests
  configs.appendRequest = {};
  // For UI themes:
  // alignLeft
  // wide
  // common
  configs.theme = 'common';
  // Container info
  configs.container = window.top.location.origin;
  configs.isInframe = window.top !== window.self;
  // Load outer configs from window
  configs.outerConfigs = window.flConfigs || {};
  // Config for slot app
  configs.isBackToList = true;
  return configs;
});