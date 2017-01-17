/**
 *
 * Load Module Dependencies.
 */
var EventEmitter = require('events').EventEmitter;

var debug   = require('debug')('api:user-controller');
var async   = require('async');
var moment  = require('moment');
var _       = require('lodash');
var emquery = require('emquery');

var User               = require('../dal/user');
var Token              = require('../dal/token');
var UserModel          = require('../models/user');
var config             = require('../config');
var CustomError        = require('../lib/custom-error');

/**
 * Create a user.
 *
 * @desc create a user and add them to the database
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.create = function createUser(req, res, next) {
  debug('create user');

  // Begin workflow
  var workflow = new EventEmitter();

  // validating user data
  // cant trust anyone
  workflow.on('validate', function validateUser() {

    var errs = req.validationErrors();

    if(errs) {
      return next(CustomError({
        name: 'USER_CREATION_ERROR',
        message: errs.message
      }));
    }

    workflow.emit('createUser');
  });

  workflow.on('createUser', function createUser() {
    var body = req.body;

    User.create(body, function (err, user) {
      if(err) {
        return next(CustomError({
          name: 'SERVER_ERROR',
          message: err.message
        }));
      }

      res.status(201).json(user);


    });


  });

  workflow.emit('validate');
};

/**
 * Get a single user.
 *
 * @desc Fetch a user with the given id from the database.
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.fetchOne = function fetchOneUser(req, res, next) {
  debug('fetch user:' + req.params.id);

  var query = {
    _id: req.params.id
  };

  User.get(query, function cb(err, user) {
    if(err) {
      return next(CustomError({
        name: 'SERVER_ERROR',
        message: err.message
      }));
    }

    res.json(user);
  });
};

/**
 * Update a single user.
 *
 * @desc Fetch a user with the given id from the database
 *       and update their data
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.update = function updateUser(req, res, next) {
  debug('updating user:'+ req.params.id);

  var query = {
    _id: req.params.id
  };
  var body = req.body;

  User.update(query, body, function cb(err, user) {
    if(err) {
      return next(CustomError({
        name: 'SERVER_ERROR',
        message: err.message
      }));
    }

    res.json(user);

  });

};

/**
 * Delete a single user.
 *
 * @desc Fetch a user with the given id from the database
 *       and delete their data
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.delete = function deleteUser(req, res, next) {
  debug('deleting user:' + req.params.id);

  var query = {
    _id: req.params.id
  };

  User.delete(query, function cb(err, user) {
    if(err) {
      return next(CustomError({
        name: 'SERVER_ERROR',
        message: err.message
      }));
    }

    res.json(user);

  });

};

/**
 * Get a collection of users
 *
 * @desc Fetch a collection of users
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAll = function fetchAllUsers(req, res, next) {
  debug('get a collection of users');

  var query = {};
  var opts = {};

  User.getCollection(query, opts, function cb(err, usersCollectionStream) {
    if(err) {
      return next(CustomError({
        name: 'SERVER_ERROR',
        message: err.message
      }));
    }

    res.setHeader('Content-Type', 'application/json');

    usersCollectionStream.pipe(res);
  });
};

/**
 * Get a collection of users by Pagination
 *
 * @desc Fetch a collection of users
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAllByPagination = function fetchAllUsers(req, res, next) {
  debug('get a collection of users by pagination');

  // retrieve pagination query params
  var page   = req.query.page || 1;
  var limit  = req.query.per_page || 10;

  var opts = {
    page: page,
    limit: limit,
    sort: { }
  };
  var query = {};

  User.getCollectionByPagination(query, opts, function cb(err, users) {
    if(err) {
      return next(CustomError({
        name: 'SERVER_ERROR',
        message: err.message
      }));
    }

    res.json(users);
  });
};
/**
 * Update the password of a user
 *
 * @desc
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.updatePassword = function updatePassword(req, res, next) {
  debug('updating password for ' + req._user.id);

  var body = req.body;

  // Validate update data

  var query = {};

  async.waterfall([
    function findUser(done) {
      UserModel.findOne(query, function (err, user) {
        if(err) {
          return done(CustomError({
            name: 'SERVER_ERROR',
            message: err.message
          }));
        }

        if(!user) {
          return done(CustomError({
            name: 'PASSWORD_UPDATE_ERROR',
            message: 'User cannot be found'
          }));

        }

        done(null, user);
      });
    },
    function hashNewPassword(user, done) {
      User.hashPasswd(body.new_password, function (err, hash) {
        if(err) {
          return done(CustomError({
            name: 'SERVER_ERROR',
            message: err.message
          }));
        }

        var update = {
          password: hash
        };

        done(null, update, user);
      });
    },
    function updateUserPassword(update, user, done) {
      query = {
        _id: user._id
      };

      User.update(query, update, function cb(err, user) {
        if(err) {
          return done(CustomError({
            name: 'SERVER_ERROR',
            message: err.message
          }));
        }


        done(null, { updated: true });

      });
    }
  ], function (err, results) {
    if(err) {
      return next(CustomError({
        name: 'SERVER_ERROR',
        message: err.message
      }));
    }

    res.json(results);

  });
};


/**
 * Archive a single user.
 *
 * @desc Fetch a user with the given id from the database
 *       and archive their data
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.archive = function archiveUser(req, res, next) {
  debug('deleting user:' + req.params.id);

  var query = {
    _id: req.params.id
  };
  var update = {
    archived: true
  };
  var user  = req._user;
  var now   = moment().toISOString();
  var tokenQuery = {
    user: user._id
  };
  var tokenUpdates = {
    value: 'EMPTY',
    revoked: true
  };

  User.update(query, update, function cb(err, user) {
    if(err) {
      return next(CustomError({
        name: 'SERVER_ERROR',
        message: err.message
      }));
    }


    Token.update(tokenQuery, tokenUpdates, function(err, token) {
      if(err) {
        return next(CustomError({
          name: 'SERVER_ERROR',
          message: err.message
        }));
      }

      res.json(user);
    });

  });

};
