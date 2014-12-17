angular.module('ui.filters', [])

.filter('chineseNumber', function() {
  return function(input) {
    var charSet = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    var str = input.toString();
    var result = "";
    // for(var index in str){
    //   result += charSet[+(str[index])];
    // }

    result = charSet[+(input)];

    return result;
  };
});