var ListPage = function() {
  this.newButton = element(by.css('.newAct button'));
  this.appPanel = element.all(by.css('.appList .panel'));

  this.get = function() {
    browser.get('http://localhost:3000/');
  };
};

describe('angularmin app list page', function() {
  var page = new ListPage();
  var ptor;

  beforeEach(function() {
    ptor = protractor.getInstance();
  });

  it('should have a new act button', function() {
    page.get();
    expect(page.newButton.isPresent()).toBeTruthy();
  });

  it('should have several app info panel', function() {
    expect(page.appPanel.count()).toBeGreaterThan(0);
  });

  it('should go to info page after click new act button', function() {
    page.newButton.click();
    expect(ptor.getCurrentUrl()).toEqual('http://localhost:3000/#/edit/12');
  });
});

