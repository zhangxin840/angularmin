var Homepage = function() {
  this.appList = element(by.css('.appListContainer'));

  this.get = function() {
    browser.get('http://localhost:3000/');
  };
};

describe('angularmin homepage', function() {
  var page = new Homepage();

  it('should show list page', function() {
    // Only get page in first test suite
    page.get();
    expect(page.appList.isPresent()).toBeTruthy();
  });
});

