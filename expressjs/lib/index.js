/**
 * Load Module Dependencies.
 */
var debug = require('debug')('api:utils');

var config = require('../config');

/**
 * Normalize a port into a number, string, or false.
 */

exports.normalizePort = function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

/**
 * Event listener for HTTP server "error" event.
 */

exports.onError = function onError(port) {
  return function(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
      process.exit(1);
      break;
      default:
        throw error;
    }
  };
};

/**
 * Event listener for HTTP server "listening" event.
 */

exports.onListening = function onListening(server) {
  return function() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;

    debug('Listening on ' + bind);

  };
};

/**
 * MongoDB error handler
 *
 * @desc Catches and handles mongodb connection errors
 */
exports.mongoError = function mongoErrorHandler () {
  debug('responding to MongoDB connection error');

  console.error('MongoDB connection error. Please make sure MongoDB is running');

  process.exit(1);
};
