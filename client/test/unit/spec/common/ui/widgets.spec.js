describe("ui.widgets", function() {
  beforeEach(module("ui.widgets"));

  it('should have a confirm method which return a promise',
    inject(function(widgets) {
      widgets.confirm();
      expect(typeof widgets.dialog().then).toBe("function");
    })
  );

  it('should have a dialog method which return a promise',
    inject(function(widgets) {
      expect(typeof widgets.dialog().then).toBe("function");
    })
  );

  it('should have a notify method which return a promise',
    inject(function(widgets) {
      expect(typeof widgets.notify().then).toBe("function");
    })
  );
});