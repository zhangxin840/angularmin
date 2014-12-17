describe('ui.directives', function() {
  var $scope;

  beforeEach(function(){
    module('ui.directives');
    inject(function($rootScope) {
      $scope = $rootScope.$new();
    });
  });

  describe("flDatetimepicker", function() {
    var elem;
    var spy;

    beforeEach(function (){
      spy = spyOn(jQuery.fn, 'datetimepicker');

      var html = '<input ng-model="test" fl-datetimepicker>';

      inject(function($compile) {
        elem = angular.element(html);
        $compile(elem)($scope);
        $scope.$digest();
      });
    });

    it('Should have jQuery plugin dependency', function() {
      expect(typeof $.fn.datepicker).toBe("function");
      expect(typeof $.fn.datetimepicker).toBe("function");
    });

    it('Should call jQuery plugin init function', function() {
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("flImageUpload", function() {
    var elem;
    var spy;

    beforeEach(function (){
      spy = spyOn(jQuery.fn, 'uploadify');

      var html = '<input ng-model="test" fl-image-upload>';

      inject(function($compile) {
        elem = angular.element(html);
        $compile(elem)($scope);
        $scope.$digest();
      });
    });

    it('Should have jQuery plugin dependency', function() {
      expect(typeof $.fn.uploadify).toBe("function");
    });

    it('Should call jQuery plugin init function', function() {
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("flInputGroup", function() {
    var elem;

    beforeEach(function (){
      var html = '<form name="mainForm"><fl-input-group title="标题" field="FTitle" model="editInfo" required maxlength="10"></fl-input-group></form>';

      inject(function($compile) {
        elem = angular.element(html);
        $compile(elem)($scope);
        $scope.$digest();
      });
    });

    it('Should extend to a group of form elements', function() {
      expect(elem.children().children().length > 1).toBe(true);
    });

    it('Should have input properties setted according to directive attrs', function() {
      expect(elem.find("input").attr("name")).toBe("FTitle");
      expect(elem.find("input").attr("required")).toBe("required");
      expect(elem.find("input").attr("placeholder")).toBe("请输入标题");
      expect(elem.find("input").attr("ng-model")).toBe("editInfo.FTitle");
    });
  });
});