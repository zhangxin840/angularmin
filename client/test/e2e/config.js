exports.config = {
  chromeOnly: true,
  rootElement: "[ng-app='flApps']",
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['**/*.spec.js'],

  suites: {
    list: 'list/**/*.spec.js',
    info: 'info/**/*.spec.js',
    crm: 'crm/**/*.spec.js',
    test: ['info/**/*.spec.js', 'crm/**/*.spec.js']
  }
};