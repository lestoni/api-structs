/**
 * Load Module Dependencies
 */
var debug  = require('debug')('api:authorization');
var _      = require('lodash');
var unless = require('express-unless');

var config      = require('../config');
var CustomError = require('./custom-error');
var Token       = require('../dal/token');

module.exports = function authorizeAccess(opts) {
  debug('init middleware');

  var options = {};

  opts = opts || {};

  _.extend(options, opts);

  function middleware (req, res, next) {
    debug('handling request for ' + req.url);

    var accessToken;

    if (req.headers && req.headers.authorization) {
      var parts = req.headers.authorization.split(' ');
      if (parts.length == 2) {
        var scheme = parts[0];
        var credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          accessToken = credentials;
        } else {
          return next(CustomError({
            name: 'CREDENTIALS_SCHEME_ERROR',
            message: 'Format is Authorization: Bearer [token]'
          }));
        }
      } else {
        return next(CustomError({
          name: 'CREDENTIALS_FORMAT_ERROR',
          message: 'Format is Authorization: Bearer [token]'
        }));
      }

    } else if (req.query && req.query['access-token']) {
      accessToken = req.query['access-token'];

    }

    if (!accessToken) {
      return next(CustomError({
        name: 'CREDENTIALS_REQUIREMENT_ERROR',
        message: 'No authorization token was found'
      }));
    }

    Token.get({ value: accessToken }, function (err, token) {
      if(err) {
        return next(err);
      }

      if(!token) {
        return next(CustomError({
          name: 'CREDENTIALS_REQUIREMENT_ERROR',
          message: 'Access Token provided is invalid'
        }));
      }

      req._user = token.user || null;

      next();
    });

  }

  middleware.unless = unless;


  return middleware;
};
