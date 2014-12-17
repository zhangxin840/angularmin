angular.module('ui.filters', []).filter('chineseNumber', function () {
  return function (input) {
    var charSet = [
        '\u96f6',
        '\u4e00',
        '\u4e8c',
        '\u4e09',
        '\u56db',
        '\u4e94',
        '\u516d',
        '\u4e03',
        '\u516b',
        '\u4e5d',
        '\u5341'
      ];
    var str = input.toString();
    var result = '';
    // for(var index in str){
    //   result += charSet[+(str[index])];
    // }
    result = charSet[+input];
    return result;
  };
});