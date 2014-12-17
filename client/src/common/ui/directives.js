angular.module('ui.directives', ['base', 'ui.widgets'])

.directive('flStopEvent', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      element.bind(attr.flStopEvent, function (e) {
        e.stopPropagation();
      });
    }
  };
})

.directive('flDatetimepicker', function() {
  return {
    require: 'ngModel',
    link: function(scope, el, attr, ngModel) {
      $.fn.datetimepicker.call($(el), {
        dateFormat : "yy-mm-dd",
        timeFormat: 'HH:mm:ss',
        dayNamesMin : [
          "日",
          "一",
          "二",
          "三",
          "四",
          "五",
          "六" ],
        monthNames : [
          "1月",
          "2月",
          "3月",
          "4月",
          "5月",
          "6月",
          "7月",
          "8月",
          "9月",
          "10月",
          "11月",
          "12月" ],
        showMonthAfterYear : true,
        yearSuffix : "年",
        timeText : '时间',
        hourText : '时',
        minuteText : '分',
        secondText : '秒',
        closeText : '关闭',
        currentText : '当前时间',
        onClose: function(dateText, inst) {
        },
        onSelect: function(dateText) {
          scope.$apply(function() {
            ngModel.$setViewValue(dateText);
          });
        }
      });

      $(el).datepicker({
        onSelect: function(dateText) {
          scope.$apply(function() {
            ngModel.$setViewValue(dateText);
          });
        }
      });
    }
  };
})

.directive('flImageUpload', function(widgets, $timeout) {
  return {
    require: 'ngModel',
    link: function(scope, el, attr, ngModel) {
      // Element must have an id
      var stamp = new Date().getTime();
      $(el).attr("id", $(el).attr("id") || ("imageUpload" +stamp));

      $(el).uploadify({
        height        : 30,
        width         : 94,
        // fileSizeLimit : '100KB',
        buttonText    : '上传图片',
        swf           : 'js/uploadify.swf',
        uploader      : '/service/image',
        onUploadError : function(file, errorCode, errorMsg, errorString) {
          widgets.confirm(file.name + ' 上传失败: ' + errorString);
        },
        onUploadSuccess : function(file, data, response) {
          var errorMessage = "";
          var dataObj;
          // Wait for image server
          var imageServerDelay = 2500;

          try{
            dataObj = JSON.parse(data);
          }
          catch (error){
          }

          if (dataObj.ret === 0) {
            // Value changed after $apply
            ngModel.$setViewValue(dataObj.data.store_url);

            $timeout(function(){
              scope.$apply(function(self) {
                if(attr.flOnSuccess){
                  self[attr.flOnSuccess](scope, file, dataObj.data);
                }
              });
            }, imageServerDelay);

          } else {
            errorMessage += file.name + ' 上传失败 ';
            errorMessage += "服务器消息：" + dataObj.msg;

            widgets.confirm(errorMessage);
          }
        }
      });
    }
  };
})

.directive('flInputGroup', function($compile, helpers) {
  var template = [
    '<div class="form-group">',
    '<label for="{{-field-}}"><i class="requiredMark" ng-show="required">*</i>{{-title-}}</label>',
    '<div class="controls">',
    '<input type="{{-type-}}" class="form-control" id="{{-field-}}" name="{{-field-}}" placeholder="{{-placeholder-}}" {{-required-}} {{-pattern-}} {{-maxlength-}} ng-model="{{-model-}}.{{-field-}}">',
    '<p class="errorMessage animate-show help-block" ng-show="{{-form-}}.{{-field-}}.$invalid && !{{-form-}}.{{-field-}}.$pristine">',
    '请输入<span ng-show="pattern || type !== \'text\'">正确的</span>{{-title-}}',
    '</p>',
    '</div>',
    '</div>'
  ].join("\n");

  return {
    restrict: "AE",
    scope: true,
    link: function($scope, el, attr) {
      var getDefaultFormName = function(){
        var name = "mainForm";

        // There is no dom object in unit test environment
        if(document && document.getElementsByTagName("form")[0]){
          name = document.getElementsByTagName("form")[0].name;
        }

        return name;
      };

      var options = {
        title: attr.title,
        field: attr.field,
        form: attr.form || getDefaultFormName(),
        model: attr.model || "scope",
        type: attr.type || "text",
        placeholder: attr.placeholder || ("请输入" + attr.title),
        pattern: attr.pattern? ('ng-pattern="' + attr.pattern + '"') : null,
        required: (typeof attr.required === "string") ? "required" : null,
        maxlength: attr.maxlength? ('maxlength="' + attr.maxlength + '"')  : null
      };

      $scope.scope = $scope;
      helpers.deepExtend($scope, options);

      // Static compile for ng directives
      var element = angular.element(helpers.staticCompile(template, options));
      // Replace before compile
      el.replaceWith(element);
      $compile(element)($scope);
    }
  };
});