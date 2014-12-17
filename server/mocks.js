var fs = require('fs');
var path = require('path');
var config = require("./config");

var mockPath = config.mocks.path;

var loadData = function(filePath, callback){
  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
      callback(err);
      return;
    }
    callback(JSON.parse(data));
  });
};

var checkDirectory = function(fileName){
  return !(fileName.split(".")[1]) && true;
};

var getFilesPath = function(root){
  var filesPath = [];
  var files = fs.readdirSync(root);
  var fileName, i;

  for(i = 0; i < files.length; i++){
    fileName = files[i];

    if(checkDirectory(fileName)){
      filesPath = filesPath.concat(getFilesPath(path.resolve(root + '/' + fileName)));
    }else{
      filesPath.push(path.resolve(root + '/' + fileName));
    }
  }

  return filesPath;
};

var getUrl = function(root ,filePath){
  return filePath.split(path.resolve(root))[1].split(".json")[0].replace(/\\/g, "/");
};

var addMockRoute = function(app,url, filePath) {
  app.all(url, function(req, res, next){
    if(req.url.split('?')[0] === url){
      loadData(filePath, function(data){
        res.json(data);
      });
    }else{
      next();
    }
  });
};

var initMocks = function(app){
  var filesPath = getFilesPath(mockPath);
  var url, i;

  for(i = 0; i < filesPath.length; i++){
    url = getUrl(mockPath, filesPath[i]);
    addMockRoute(app,url, filesPath[i]);
  }
};

var init = function(app){
  initMocks(app);
};

module.exports = {
  init: init
};