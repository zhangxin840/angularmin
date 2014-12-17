describe("base", function() {
  var helpers;

  beforeEach(function(){
    module('base');

    inject(function(_helpers_) {
      helpers = _helpers_;
    });
  });

  it('should contain an removeItem helper',function(){
    expect(helpers.removeItem).not.toBe(null);
  });

  it('should contain an haveItem helper',function(){
    expect(helpers.haveItem).not.toBe(null);
  });

  it('should contain an deepExtend helper', function() {
    expect(helpers.deepExtend).not.toBe(null);
  });

  it('should contain an objectSize helper', function() {
    expect(helpers.objectSize).not.toBe(null);
  });

  it('should contain an serializeParam helper', function() {
    expect(helpers.serializeParam).not.toBe(null);
  });

  it('should contain an serializeParam helper', function() {
    expect(helpers.serializeParam).not.toBe(null);
  });

  it('should contain an getDate helper', function() {
    expect(helpers.getDate).not.toBe(null);
  });

  it('should contain an replaceAll helper', function() {
    expect(helpers.replaceAll).not.toBe(null);
  });

  it('should contain an staticCompile helper', function() {
    expect(helpers.staticCompile).not.toBe(null);
  });

  it('should contain an addUrlPerfix helper', function() {
    expect(helpers.addUrlPerfix).not.toBe(null);
  });

  describe("removeItem", function() {
    it("should remove item from array by index or reference", function() {
      var b = {};
      var a = [1, 2, b, 4];

      // By object
      helpers.removeItem(a, b);
      expect(a[2]).toBe(4);

      // By index
      helpers.removeItem(a, 2);
      expect(a[1]).toBe(2);
    });
  });

  describe("haveItem", function() {
    it("should check if an array contain that item", function() {
      var b = {};
      var a = [1, 2, b, 4];

      expect(helpers.haveItem(a, b)).toBeTruthy();
      expect(helpers.haveItem(a, {})).toBeFalsy();
    });
  });

  describe("deepExtend", function() {
    it("should extend target object like jQuery extend", function() {
      var a = {foo: "hi there", bar: { blah: 123, quux: [1, 2, 3] }};
      var b = {bar: {zx: 345}, c: [1, 2, 3]};
      helpers.deepExtend(a, b);

      expect(a.foo).toBe("hi there");
      expect(a.bar.blah).toBe(123);
      expect(a.bar.zx).toBe(345);
      expect(a.c == b.c).toBe(false);
    });
  });

  describe("objectSize", function() {
    it("should get key size of an object", function() {
      var a = {foo: "hi there", bar: { blah: 123, quux: [1, 2, 3] }};
      var result = helpers.objectSize(a);
      expect(result).toBe(2);
    });
  });

  describe("serializeParam", function() {
    it("should convert object to query string", function() {
      var a = {foo: "hi there", bar: { blah: 123, quux: [1, 2, 3] }};
      var result = helpers.serializeParam(a);
      expect(result).toBe("foo=hi%20there&bar%5Bblah%5D=123&bar%5Bquux%5D%5B0%5D=1&bar%5Bquux%5D%5B1%5D=2&bar%5Bquux%5D%5B2%5D=3");
    });
  });

  describe("getDate", function() {
    it("should get date from string", function() {
      expect(helpers.getDate(null)).toBe(null);
      expect(helpers.getDate()).toBe(null);
      expect(helpers.getDate("zxz")).toBe(null);
      expect(helpers.getDate("2014-05-06 00:01:12").toString()).toEqual(new Date("2014-05-06T00:01:12+08:00").toString());
    });
  });

  describe("replaceAll", function() {
    it("should replace all matches of string", function() {
      var target = "test {{ }} ";
      expect(helpers.replaceAll(target, " ", ",")).toBe("test,{{,}},");
      expect(target).toBe("test {{ }} ");
    });
  });

  describe("staticCompile", function() {
    it("should compile a templete string by an object", function() {
      var templete = "test {{-key1-}} {{-key2-}}";
      var compileObj = {
        key1: "z",
        key2: "x",
        key3: "aaa"
      };

      expect(helpers.staticCompile(templete, compileObj)).toBe("test z x");
      expect(templete).toBe("test {{-key1-}} {{-key2-}}");
    });
  });

  describe("addUrlPerfix", function() {
    it("should add http perfix to a string", function() {
      var url = "abc";
      expect(helpers.addUrlPerfix(url)).toBe("http://abc");
      expect(url).toBe("abc");

      expect(helpers.addUrlPerfix("https://abc")).toBe("https://abc");
      expect(helpers.addUrlPerfix("ftp://abc")).toBe("ftp://abc");
      expect(helpers.addUrlPerfix()).toBe("");
      expect(helpers.addUrlPerfix("")).toBe("");
    });
  });
});
