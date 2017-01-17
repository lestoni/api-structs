/** * Load Module dependencies.
 */
var path = require('path');
var env     = process.env;

var PORT        = env.PORT || 8000;
var API_URL     = '127.0.0.1:8000';
var MONGODB_URL = env.MONGODB_URL || 'mongodb://127.0.0.1:27017/db';
var NODE_ENV    = env.NODE_ENV || 'development';
var HOST        = 'localhost';

module.exports = {

  API_URL: API_URL,

  ENV: NODE_ENV,

  PORT: PORT,

  HOST: HOST,

  // MongoDB URL
  MONGODB: {
    URL: MONGODB_URL,
    OPTS: {
      server:{
        auto_reconnect:true
      }
    }
  },

  CORS_OPTS: {
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization'
  },

  SALT_FACTOR: 12,

  TOKEN: {
    RANDOM_BYTE_LENGTH: 32
  },

  MEDIA: {
    FILE_SIZE: 2 * 1024 * 1024, // 1MB,
    URL: API_URL + '/media/',
    FILES_FOLDER: path.resolve(process.cwd(), './media') + '/'
  }
};
