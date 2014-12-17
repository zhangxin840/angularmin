var path = require('path');

module.exports = {
  static: path.resolve(__dirname, '../client/dist'),

  mocks:{
    path: path.resolve(__dirname, './mocks')
  },
  server: {
    port: 3000,
    ip: '0.0.0.0'
  }
};