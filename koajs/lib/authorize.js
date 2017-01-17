'use strict';
/**
 * Load Module Dependencies
 */
const debug  = require('debug')('api:authorization');
const _      = require('lodash');
const unless = require('koa-unless');

const config      = require('../config');
const CustomError = require('./custom-error');
const Token       = require('../controllers/dal/token');

module.exports = function authorizeAccess() {

  function* authMiddleware(next) {
    debug(`handling request for ${this.url}`);

    let accessToken;
    let headers = this.headers;

    if (headers && headers.authorization) {
      let parts = headers.authorization.split(' ');

      if (parts.length == 2) {
        let scheme = parts[0];
        let credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          accessToken = credentials;

        } else {
          return this.throw(new CustomError({
            type: 'CREDENTIALS_SCHEME_ERROR',
            message: 'Format is Authorization: Bearer [token]'
          }));

        }
      } else {
        return this.throw( new CustomError({
          type: 'CREDENTIALS_FORMAT_ERROR',
          message: 'Format is Authorization: Bearer [token]'
        }));
      }

    } else if (this.query && this.query['access-token']) {
      accessToken = this.query['access-token'];

    }

    if (!accessToken) {
      this.throw(new CustomError({
        type: 'CREDENTIALS_REQUIREMENT_ERROR',
        message: 'No authorization token was found'
      }));
    }


    try {
      let token = yield Token.get({ value: accessToken });

      if(!token || !token._id) {
        this.throw(new CustomError({
          type: 'CREDENTIALS_REQUIREMENT_ERROR',
          message: 'Access Token provided is invalid'
        }));
      }

      this.state._user = token.user;

      yield next;
    } catch(ex) {
      this.throw(new CustomError({
        type: 'SERVER_ERROR',
        message: ex.message
      }));
    }

  }

  authMiddleware.unless = unless;


  return authMiddleware;
};
