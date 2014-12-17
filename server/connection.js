var http  = require('http');
var express = require('express');
var path = require('path');
var open = require('open');
var config = require('./config.js');

var app = express();

var start = function(){
  // Set static folder
  app.use(express.static(config.static));

  // Start server
  app.listen(config.server.port, function(){
    console.log("Server started at: " + config.server.port);
  });

  // Open browser
  open('http://localhost:' + config.server.port + '/');
};

module.exports = {
  start: start,
  app: app
};
