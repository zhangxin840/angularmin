describe("utils", function() {
  beforeEach(module('utils'));

  describe("factories", function() {
    it('should contain an configs factory',
      inject(function(configs) {
        expect(configs).not.toBe(null);
      })
    );

    it('should contain an helpers factory',
      inject(function(helpers) {
        expect(helpers).not.toBe(null);
      })
    );

    it('should contain an widgets factory',
      inject(function(widgets) {
        expect(widgets).not.toBe(null);
      })
    );

    it('should contain an remote factory',
      inject(function(remote) {
        expect(remote).not.toBe(null);
      })
    );
  });
});

















