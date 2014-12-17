var InfoPage = function() {
  this.albums = element.all(by.repeater('album in editInfo.FAlbums'));
  this.albumName = element(by.repeater('album in editInfo.FAlbums').row(0)).element(by.model('album.FName'));
  this.deleteAlbum = element(by.css('.section .deleteSection'));

  this.get = function() {
    browser.get('http://localhost:3000/#/edit/12');
  };
};

describe('angularmin app info page', function() {
  var page = new InfoPage();
  var ptor;

  beforeEach(function() {
    ptor = protractor.getInstance();
  });

  it('should have album name field', function() {
    page.get();
    expect(page.albumName.getAttribute('value')).toEqual('欧洲风情');
  });

  it('should show error if album name field is invalid', function() {
    page.albumName.clear();
    expect(page.albumName.getAttribute('class')).toMatch('ng-invalid');
  });

  it('should delete album after click delete button', function() {
    page.deleteAlbum.click();
    expect(page.albums.count()).toEqual(2);
  });
});

