describe("ui.filters", function() {
  var $filter;

  beforeEach(function(){
    module('ui.filters');

    inject(function(_$filter_) {
      $filter = _$filter_;
    });
  });

  it('should contain an chineseNumber filter', function() {
    expect($filter("chineseNumber")).not.toBe(null);
  });

  describe("chineseNumber", function() {
    it("should convert number to Chinese", function() {
      expect($filter("chineseNumber")("2")).toBe("二");
    });
  });
});