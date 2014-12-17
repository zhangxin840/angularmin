var connection = require("./connection");
var config = require("./config");
var mocks = require("./mocks");

var app = connection.app;

mocks.init(app);
connection.start();


