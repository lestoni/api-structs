'use strict';
// Access Layer for User Data.

/**
 * Load Module Dependencies.
 */
const debug   = require('debug')('api:dal-user');
const moment  = require('moment');
const _       = require('lodash');
const co      = require('co');

const User        = require('../../models/user');
const mongoUpdate = require('../../lib/mongo-update');

var returnFields = User.attributes;
var population = [];

/**
 * create a new user.
 *
 * @desc  creates a new user and saves them
 *        in the database
 *
 * @param {Object}  userData  Data for the user to create
 *
 * @return {Promise}
 */
exports.create = function create(userData) {
  debug('creating a new user');

  let searchQuery = { email: userData.email };

  return co(function* () {
    let userExists = yield exports.get(searchQuery);

    if(userExists && !!userExists._id) {
      let err = new Error('User Already Exists');
      err.type = 'USER_CREATION_ERROR';

      return yield Promise.reject(err);

    } else {
      let unsavedUser = new User(userData);
      let newUser = yield unsavedUser.save();
      let user = yield exports.get({ _id: newUser._id });

      return user;

    }

  }).then((user) => {
    return Promise.resolve(user);
  },(err) => {
    return Promise.reject(err);
  });


};

/**
 * delete a user
 *
 * @desc  delete data of the user with the given
 *        id
 *
 * @param {Object}  query   Query Object
 *
 * @return {Promise}
 */
exports.delete = function deleteUser(query) {
  debug('deleting user: ', query);

  return co(function* () {
    let user = yield exports.get(query);
    let _empty = {};

    if(!user) {
      return _empty;
    } else {
      yield user.remove();

      return user;
    }
  }).then((user) => {
    return Promise.resolve(user);
  }, (err) => {
    return Promise.reject(err);
  });
};

/**
 * update a user
 *
 * @desc  update data of the user with the given
 *        id
 *
 * @param {Object} query Query object
 * @param {Object} updates  Update data
 *
 * @return {Promise}
 */
exports.update = function update(query, updates) {
  debug('updating user: ', query);

  let now = moment().toISOString();
  let opts = {
    'new': true,
    select: returnFields
  };

  updates = mongoUpdate(updates);

  let promise = User
      .findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec();

  return promise;
};

/**
 * get a user.
 *
 * @desc get a user with the given id from db
 *
 * @param {Object} query Query Object
 *
 * @return {Promise}
 */
exports.get = function get(query) {
  debug('getting user ', query);

  let promise = User
    .findOne(query, returnFields)
    .populate(population)
    .exec();

  return promise;
};

/**
 * get a collection of users
 *
 * @desc get a collection of users from db
 *
 * @param {Object} query Query Object
 *
 * @return {Promise}
 */
exports.getCollection = function getCollection(query, qs) {
  debug('fetching a collection of users');

  return new Promise((resolve, reject) => {
    resolve(
     User
      .find(query, returnFields)
      .populate(population)
      .stream());
  });


};

/**
 * get a collection of users using pagination
 *
 * @desc get a collection of users from db
 *
 * @param {Object} query Query Object
 *
 * @return {Promise}
 */
exports.getCollectionByPagination = function getCollection(query, qs) {
  debug('fetching a collection of users');

  let opts = {
    columns:  returnFields,
    sortBy:   qs.sort || {},
    populate: population,
    page:     qs.page,
    limit:    qs.limit
  };


  return new Promise((resolve, reject) => {
    User.paginate(query, opts, function (err, docs) {
      if(err) {
        return reject(err);
      }

      let data = {
        total_pages: docs.pages,
        total_docs_count: docs.total,
        current_page: docs.page,
        docs: docs.docs
      };

      return resolve(data);

    });
  });


};


/**
 * Hash password
 */
exports.hashPasswd = function hashPasswd(passwd) {
  User.hashPasswd(passwd, cb);

  return new Promise((resolve, reject) => {
    User.hashPasswd(passwd, (err, hash) => {
      if(err) {
        return reject(err);
      }

      resolve(hash);
    });
  });
};
