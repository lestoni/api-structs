/**
 *
 * Load Module Dependencies.
 */
var EventEmitter = require('events').EventEmitter;
var crypto       = require('crypto');

var debug     = require('debug')('api:user-controller');
var async     = require('async');
var moment    = require('moment');
var validator = require('validator');
var _         = require('lodash');

var User      = require('../dal/user');
var UserModel = require('../models/user');
var Token     = require('../dal/token');
var config    = require('../config');
var CustomError = require('../lib/custom-error');

function createToken() {
  debug('generate a token');

  var sha256 = crypto.createHash('sha256');
  var retry = 1;
  var randomBytes;

  try {
    randomBytes = crypto.randomBytes(config.TOKEN.RANDOM_BYTE_LENGTH).toString('hex');

    return sha256.update(randomBytes).digest('base64');

  } catch(ex) {
    if(retry <= 5) {
      createToken();
    }

    throw ex;
  }
}


/**
 * Login a user
 *
 * @desc login a user using their phone number/email and password.
 * Return profile and user data with an authentication token.
 */
exports.login = function loginUser(req, res, next) {
  debug('login a user');

  var body = req.body;

  async.waterfall([
    // Fetch user
    function getUser(next) {
      if(body.email) {
        UserModel.findOne({ email: body.email }, next);

      } else {
        return next(null, null);
      }

    }, function verifyPasswd(user, next) {
      if(!user || user.archived) {
        return next(CustomError({
          name: 'AUTHENTICATION_ERROR',
          message: 'User does not exist'
        }));

      }

      user.verifyPassword(body.password, function (err, isMatch) {
        if(err) {
          return next(CustomError({
            name: 'SERVER_ERROR',
            message: err.message
          }));
        }

        if(!isMatch) {
          return next(CustomError({
            name: 'AUTHENTICATION_ERROR',
            message: 'Password provided is invalid'
          }));
        }

        User.get({ email: body.email }, next);

      });

    } , function getInfo(user, next) {
        Token.get({ user: user._id }, function(err, token) {
          if(err) {
            return next(CustomError({
              name: 'SERVER_ERROR',
              message: err.message
            }));
          }

          var info = {
            user: user,
            token: token || {}
          };

          next(null, info);
        });

    }, function generateToken(info, next) {
      var token;
      var isNew;

      if(info.token.value && !info.token.revoked) {
        token = info.token.value;
        isNew = false;
      } else {
        token = createToken();
        isNew = true;
      }

      var data = {
        token: token,
        user: info.user
      };

      info.isNew = isNew;

      next(null, info, data);

    }, function enableToken(info, data, next) {
      var now = moment().toISOString();

      if(!info.isNew) {
        return next(null, data);
      }

      // First time login
      if(!info.token.user) {
        var tokenData = ({
          value: data.token,
          user: info.user._id,
          revoked: false
        });

        Token.create(tokenData, function(err, token) {
          if(err) {
            return next(CustomError({
              name: 'SERVER_ERROR',
              message: err.message
            }));
          }

          next(null, data);
        });

      } else {
        // Existing user
        var query = {
          _id: info.token._id
        };
        var updates = {
          $set: {
            value: data.token,
            revoked: false
          }
        };

        Token.update(query, updates, function(err, token) {
          if(err) {
            return next(CustomError({
              name: 'SERVER_ERROR',
              message: err.message
            }));
          }

          next(null, data);
        });
      }


    }, function setLastLogin(data, next) {
      var update = { $set: { last_login: moment().toISOString() } };

      User.update({ _id: data.user._id }, update, function (err) {
        if(err) {
          return next(CustomError({
            name: 'SERVER_ERROR',
            message: err.message
          }));
        }

        next(null, data);
      });
    }
  ], function done(err, info) {
    if(err) {
      return next(err);
    }


    info = {
      user: info.user,
      token: info.token
    };
    res.json(info);

  });
};

/**
 * Log out a user.
 */
exports.logout = function logoutUser(req, res, next) {
  debug('logout user');

  if(!req._user) {
    return next(CustomError({
      name: 'LOGOUT_ERROR'
    }));
  }
  var user  = req._user;
  var now   = moment().toISOString();
  var query = {
    user: req._user._id
  };
  var updates = {
    $set: {
      value: 'EMPTY',
      revoked: true
    }
  };

  Token.update(query, updates, function(err, token) {
    if(err) {
      return next(CustomError({
        name: 'SERVER_ERROR',
        message: err.message
      }));
    }

    res.json({
      logged_out: true
    });
  });
};


exports.accessControl = function accessControl(roles, action) {
  debug('Access controll management');

  action = action || 'ALLOW';

  return function (req, res, next) {
    var user = req._user;

    if(!user) {
      return next(CustomError({
        name: 'AUTHORIZATION_ERROR',
        message: 'Please Login or register to continue'
      }));
    }

    var userRole  = user.role;
    var userRealm = user.realm;
    var allowed   = false;

    roles = Array.isArray(roles) ? roles: [roles];

    roles.forEach(function(role) {
      switch(role) {
        case '*':
        case userRole:
        case userRealm:
          allowed = true;
          break;
      }

    });

    if(!allowed) {
      return next(CustomError({
        name: 'AUTHORIZATION_ERROR'
      }));

    } else {
      return next();

    }

  };
};
