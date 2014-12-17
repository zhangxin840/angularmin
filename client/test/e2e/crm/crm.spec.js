var CrmPage = function() {
  this.alertInfo = element(by.css('.alert'));

  this.get = function() {
    browser.get('http://localhost:3000/#/crm/12');
  };
};

describe('angularmin crm page', function() {
  var page = new CrmPage();
  var ptor;

  beforeEach(function() {
    ptor = protractor.getInstance();
  });

  it('should show empty info', function() {
    page.get();
    expect(page.alertInfo.isPresent()).toBeTruthy();
  });
});

