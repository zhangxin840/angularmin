describe("ui", function() {
  var theModule;
  theModule = angular.module("ui");

  it("should be registered", function() {
    expect(theModule).not.toBe(null);
  });

  describe("dependencies", function() {

    var deps;
    beforeEach(function() {
      deps = theModule.value('appName').requires;
    });

    var hasModule = function(m) {
      return deps.indexOf(m) >= 0;
    };

    it("should have cgBusy as a dependency", function() {
      expect(hasModule('cgBusy')).toBe(true);
    });

    it("should have ngAnimate as a dependency", function() {
      expect(hasModule('ngAnimate')).toBe(true);
    });
  });
});













