'use strict';

/**
 * Load Module Dependencies
 */
const debug = require('debug')('api:errorHandler-middleware');

module.exports = function errorHandler() {
  return function* (next) {
    try {
      yield next;

    } catch (err) {
      let status = err.status || 500;
      let message = {
        error: {
          status: status,
          message: err.message,
          type: err.type
        }
      };

      this.status = status;
      this.body = message;
      this.app.emit('error', err, this);

    }
  };
};
