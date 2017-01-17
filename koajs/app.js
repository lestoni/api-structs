'use strict';

/**
 * Load Module Dependencies
 */
const http = require('http');
const path = require('path');

const koa        = require('koa');
const mongoose   = require('mongoose');
const validator  = require('koa-validate');
const cors       = require('koa-cors');
const debug      = require('debug')('api:server');
const serve      = require('koa-static');
const logger     = require('koa-logger');
const etag       = require('koa-etag');
const conditional = require('koa-conditional-get');
const bodyParser = require('koa-body');

const config       = require('./config');
const utils        = require('./lib/utils');
const authorize    = require('./lib/authorize');
const errorHandler = require('./lib/error-handler');
const router       = require('./routes');

const PORT = config.PORT;

let app = koa();
let server;

// connect to MongoDB
mongoose.connect(config.MONGODB.URL, config.MONGODB.OPTS);

// Add MongoDB connection error Handler
mongoose.connection.on('error', () => {
  debug('responding to MongoDB connection error');

  console.error('MongoDB connection error. Please make sure MongoDB is running');

  process.exit(1);
});

// Add Handler for MongoDB Disconnection Handler
mongoose.connection.on('disconnected', () => {
  // Reconnect to MongoDB
  mongoose.connect(config.MONGODB.URL, config.MONGODB.OPTS);
});

/**
 * Application Settings
 */

// Enable Proxy Trust
if(app.env === 'production') {
  app.proxy = true;
}

/**
 * Setup Middleware.
 */

// Set Error Handler
app.use(errorHandler());

// Enable Console logging(only in development)
if(app.env === 'development') {
  app.use(logger());
}

// Enable setting of Etag Header for caching
app.use(conditional());
app.use(etag());

// Serve Documentation Files
app.use(serve(path.join(__dirname, 'documentation')));

// Enable Token-Based Auth
app.use(authorize().unless({ path: router.OPEN_ENDPOINTS }));

// Enable Body parser
app.use(bodyParser());

// Enable CORS
app.use(cors());

// Enable Request Body Parsing
//app.use(bodyParser());

// Set Validator for Request bodies
app.use(validator());

//--Routes--//

app.use(router.routes());


//-- Create HTTP Server --//

server = http.createServer(app.callback());

// Listen on provided port, on all network interfaces
server.listen(PORT);

// Set Error Handler for the server
server.on('error', (error) => {
  debug('Server ConnectionError Triggered');

  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = (typeof PORT === 'string') ? `Pipe ${PORT}` : `Port ${PORT}`;

  // Handle Specific listen errors with friendly messages.
  switch(error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Set handler for 'listening' event
server.on('listening', () => {
  let addr = server.address();
  let bind = (typeof PORT === 'string') ? `Pipe ${PORT}` : `Port ${PORT}`;

  debug(`Listening on ${bind}`);

});

// Export app for testing
module.exports = app;
