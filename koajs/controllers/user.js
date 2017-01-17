'use strict';
/**
 * Load Module Dependencies.
 */
const debug   = require('debug')('api:user-controller');
const moment  = require('moment');
const jsonStream = require('streaming-json-stringify');

const UserDal            = require('./dal/user');
const Token              = require('./dal/token');
const UserModel          = require('../models/user');
const config             = require('../config');
const CustomError        = require('../lib/custom-error');

/**
 * Create a user.
 *
 * @desc create a user and add them to the database
 *
 * @param {Function} next Middleware dispatcher
 */
exports.create = function* createUser(next) {
  debug('create user');

  let body = this.request.body;

  if(this.errors) {
    let err = new CustomError({
      type: 'USER_CREATION_ERROR',
      message: this.errors
    });

    return this.throw(err);
  }

  try {
    let user = yield UserDal.create(body);

    this.status = 201;
    this.body = user;

  } catch(ex) {
    this.throw(new CustomError({
      type: ex.type || 'SERVER_ERROR',
      message: ex.message
    }));
  }

};

/**
 * Get a single user.
 *
 * @desc Fetch a user with the given id from the database.
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchOne = function* fetchOneUser(next) {
  debug(`fetch user: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };

  try {
    let user = yield UserDal.get(query);

    this.body = user;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'SERVER_ERROR',
      message: err.message
    }));
  }

};

/**
 * Update a single user.
 *
 * @desc Fetch a user with the given id from the database
 *       and update their data
 *
 * @param {Function} next Middleware dispatcher
 */
exports.update = function* updateUser(next) {
  debug(`updating user: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  try {
    let user = yield UserDal.update(query, body);

    this.body = user;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'SERVER_ERROR',
      message: err.message
    }));

  }

};

/**
 * Delete a single user.
 *
 * @desc Fetch a user with the given id from the database
 *       and delete their data
 *
 * @param {Function} next Middleware dispatcher
 */
exports.delete = function* deleteUser(next) {
  debug(`deleting user: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };

  try {
    let user = yield UserDal.delete(query);

    this.body = user;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'SERVER_ERROR',
      message: err.message
    }));
  }

};

/**
 * Get a collection of users
 *
 * @desc Fetch a collection of users
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAll = function* fetchAllUsers(next) {
  debug('get a collection of users');

  let query = {};
  let opts = {};

  try {
    let usersCollectionStream = yield UserDal.getCollection(query, opts);
    let stream;

    this.type = 'json';

    stream = this.body = usersCollectionStream.pipe(jsonStream());

    stream.on('error', (err) => {
      stream.end();

      return this.throw(new CustomError({
        type: 'SERVER_ERROR',
        message: 'Error retrieving collection'
      }));
    });
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'SERVER_ERROR',
      message: err.message
    }));
  }

};

/**
 * Get a collection of users by Pagination
 *
 * @desc Fetch a collection of users
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAllByPagination = function* fetchAllUsers(next) {
  debug('get a collection of users by pagination');

  // retrieve pagination query params
  let page   = req.query.page || 1;
  let limit  = req.query.per_page || 10;
  let query = {};
  let opts = {
    page: page,
    limit: limit,
    sort: { }
  };

  try {
    let users = yield UserDal.getCollectionByPagination(query, opts);

    this.body = users;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'SERVER_ERROR',
      message: ex.message
    }));
  }
};
/**
 * Update the password of a user
 *
 * @desc
 *
 * @param {Function} next Middleware dispatcher
 */
exports.updatePassword = function* updatePassword( next) {
  debug(`updating password for ${this.state._user.id}`);

  let body = this.request.body;
  let query = {};

  co(function* () {
    let user = yield UserModel.findOne(query).exec();

    if(!user) {
      return yield Promise.reject(new CustomError({
        type: 'PASSWORD_UPDATE_ERROR',
        message: 'User cannot be found'
      }));
    }

    let hash = yield UserDal.hashPasswd(body.new_password);
    let update = { password: hash };
    let query = { _id: user._id };

    return yield UserDal.update(query, update);

  }).then((user) => {
    this.body = { updated: true };

  }).catch((err) => {
    this.throw(new CustomError({
      type: err.type || 'SERVER_ERROR',
      message: err.message
    }));

  });

};
