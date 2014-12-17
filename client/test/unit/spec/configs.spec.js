describe("configs", function() {
  var configs;

  beforeEach(function() {
    window.flConfigs = {
      isInFrame: true
    };

    module("configs");

    inject(function(_configs_){
      configs = _configs_;
    });
  });

  it("should have outer configs from window", function() {
    expect(configs.outerConfigs.isInFrame).toBe(true);
  });
});