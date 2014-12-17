angular.module('utils', [
  'configs',
  'base',
  'services.remote',
  'ui',
  'container'
]).config(function () {
}).run([
  'configs',
  'remote',
  'helpers',
  function (configs, remote, helpers) {
  }
]);