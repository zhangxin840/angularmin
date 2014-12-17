angular.module('ui.directives', [
  'base',
  'ui.widgets'
]).directive('flStopEvent', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      element.bind(attr.flStopEvent, function (e) {
        e.stopPropagation();
      });
    }
  };
}).directive('flDatetimepicker', function () {
  return {
    require: 'ngModel',
    link: function (scope, el, attr, ngModel) {
      $.fn.datetimepicker.call($(el), {
        dateFormat: 'yy-mm-dd',
        timeFormat: 'HH:mm:ss',
        dayNamesMin: [
          '\u65e5',
          '\u4e00',
          '\u4e8c',
          '\u4e09',
          '\u56db',
          '\u4e94',
          '\u516d'
        ],
        monthNames: [
          '1\u6708',
          '2\u6708',
          '3\u6708',
          '4\u6708',
          '5\u6708',
          '6\u6708',
          '7\u6708',
          '8\u6708',
          '9\u6708',
          '10\u6708',
          '11\u6708',
          '12\u6708'
        ],
        showMonthAfterYear: true,
        yearSuffix: '\u5e74',
        timeText: '\u65f6\u95f4',
        hourText: '\u65f6',
        minuteText: '\u5206',
        secondText: '\u79d2',
        closeText: '\u5173\u95ed',
        currentText: '\u5f53\u524d\u65f6\u95f4',
        onClose: function (dateText, inst) {
        },
        onSelect: function (dateText) {
          scope.$apply(function () {
            ngModel.$setViewValue(dateText);
          });
        }
      });
      $(el).datepicker({
        onSelect: function (dateText) {
          scope.$apply(function () {
            ngModel.$setViewValue(dateText);
          });
        }
      });
    }
  };
}).directive('flImageUpload', [
  'widgets',
  '$timeout',
  function (widgets, $timeout) {
    return {
      require: 'ngModel',
      link: function (scope, el, attr, ngModel) {
        // Element must have an id
        var stamp = new Date().getTime();
        $(el).attr('id', $(el).attr('id') || 'imageUpload' + stamp);
        $(el).uploadify({
          height: 30,
          width: 94,
          buttonText: '\u4e0a\u4f20\u56fe\u7247',
          swf: 'js/uploadify.swf',
          uploader: '/service/image',
          onUploadError: function (file, errorCode, errorMsg, errorString) {
            widgets.confirm(file.name + ' \u4e0a\u4f20\u5931\u8d25: ' + errorString);
          },
          onUploadSuccess: function (file, data, response) {
            var errorMessage = '';
            var dataObj;
            // Wait for image server
            var imageServerDelay = 2500;
            try {
              dataObj = JSON.parse(data);
            } catch (error) {
            }
            if (dataObj.ret === 0) {
              // Value changed after $apply
              ngModel.$setViewValue(dataObj.data.store_url);
              $timeout(function () {
                scope.$apply(function (self) {
                  if (attr.flOnSuccess) {
                    self[attr.flOnSuccess](scope, file, dataObj.data);
                  }
                });
              }, imageServerDelay);
            } else {
              errorMessage += file.name + ' \u4e0a\u4f20\u5931\u8d25 ';
              errorMessage += '\u670d\u52a1\u5668\u6d88\u606f\uff1a' + dataObj.msg;
              widgets.confirm(errorMessage);
            }
          }
        });
      }
    };
  }
]).directive('flInputGroup', [
  '$compile',
  'helpers',
  function ($compile, helpers) {
    var template = [
        '<div class="form-group">',
        '<label for="{{-field-}}"><i class="requiredMark" ng-show="required">*</i>{{-title-}}</label>',
        '<div class="controls">',
        '<input type="{{-type-}}" class="form-control" id="{{-field-}}" name="{{-field-}}" placeholder="{{-placeholder-}}" {{-required-}} {{-pattern-}} {{-maxlength-}} ng-model="{{-model-}}.{{-field-}}">',
        '<p class="errorMessage animate-show help-block" ng-show="{{-form-}}.{{-field-}}.$invalid && !{{-form-}}.{{-field-}}.$pristine">',
        '\u8bf7\u8f93\u5165<span ng-show="pattern || type !== \'text\'">\u6b63\u786e\u7684</span>{{-title-}}',
        '</p>',
        '</div>',
        '</div>'
      ].join('\n');
    return {
      restrict: 'AE',
      scope: true,
      link: function ($scope, el, attr) {
        var getDefaultFormName = function () {
          var name = 'mainForm';
          // There is no dom object in unit test environment
          if (document && document.getElementsByTagName('form')[0]) {
            name = document.getElementsByTagName('form')[0].name;
          }
          return name;
        };
        var options = {
            title: attr.title,
            field: attr.field,
            form: attr.form || getDefaultFormName(),
            model: attr.model || 'scope',
            type: attr.type || 'text',
            placeholder: attr.placeholder || '\u8bf7\u8f93\u5165' + attr.title,
            pattern: attr.pattern ? 'ng-pattern="' + attr.pattern + '"' : null,
            required: typeof attr.required === 'string' ? 'required' : null,
            maxlength: attr.maxlength ? 'maxlength="' + attr.maxlength + '"' : null
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
  }
]);