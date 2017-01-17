'use strict';
// Access Layer for Resource Data.

/**
 * Load Module Dependencies.
 */
const debug   = require('debug')('api:dal-resource');
const moment  = require('moment');
const _       = require('lodash');
const co      = require('co');

const Resource    = require('../../models/model');
const mongoUpdate = require('../../lib/mongo-update');

const returnFields = Resource.whitelist;
var population = [];

/**
 * create a new resource.
 *
 * @desc  creates a new resource and saves them
 *        in the database
 *
 * @param {Object}  resourceData  Data for the resource to create
 */
exports.create = function create(resourceData) {
  debug('creating a new resource');

  let searchQuery = { };

  return co(function* () {
    let isPresent = yield Resource.findOne(searchQuery).exec();

    if(isPresent) {
      let err = new Error('Model Already Exists');
      err.type = 'MODEL_CREATION_ERROR';

      return yield Promise.reject(err);
    }

    let newResource = new Resource(resourceData);
    let resource = yield newResource.save();

    return yield exports.get({ _id: resource._id});

  }).then((resource) => {
    return Promise.resolve(resource);
  }).catch((err) => {
    return Promise.reject(err);
  });

};

/**
 * delete a resource
 *
 * @desc  delete data of the resource with the given
 *        id
 *
 * @param {Object}  query   Query Object
 */
exports.delete = function deleteItem(query) {
  debug(`deleting resource: ${query}`);

  return co(function* () {
    let resource = yield exports.get(query);
    let _empty = {};

    if(!resource) {
      return _empty;
    } else {
      yield resource.remove();

      return resource;
    }
  }).then((resource) => {
    return Promise.resolve(resource);
  }, (err) => {
    return Promise.reject(err);
  });
};

/**
 * update a resource
 *
 * @desc  update data of the resource with the given
 *        id
 *
 * @param {Object} query Query object
 * @param {Object} updates  Update data
 */
exports.update = function update(query, updates) {
  debug(`updating resource: ${query}`);

  let now = moment().toISOString();
  let opts = {
    'new': true,
    select: returnFields
  };

  updates = mongoUpdate(updates);

  let promise = Resource
      .findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec();

  return promise;
};

/**
 * get a resource.
 *
 * @desc get a resource with the given id from db
 *
 * @param {Object} query Query Object
 */
exports.get = function get(query) {
  debug(`getting resource ${query}`);

  let promise = Resource
      .findOne(query, returnFields)
      .populate(population)
      .exec();

  return promise;
};

/**
 * get a collection of resources
 *
 * @desc get a collection of resources from db
 *
 * @param {Object} query Query Object
 */
exports.getCollection = function getCollection(query, qs) {
  debug('fetching a collection of resources');

  return new Promise((resolve, reject) => {
    resolve(
       Resource
       .find(query, returnFields)
       .populate(population)
       .stream());
  });

};

/**
 * get a collection of resources using pagination
 *
 * @desc get a collection of resources from db
 *
 * @param {Object} query Query Object
 */
exports.getCollectionByPagination = function getCollection(query, qs) {
  debug('fetching a collection of resources');

  let opts = {
    columns:  returnFields,
    sortBy:   qs.sort || {},
    populate: population,
    page:     qs.page,
    limit:    qs.limit
  };

  return new Promise((resolve, reject) => {
    Resource.paginate(query, opts, function (err, docs) {
      if(err) {
        return reject(err);
      }

      let data = {
        total_pages: docs.pages,
        total_docs_count: docs.total,
        current_page: docs.page,
        docs: docs.docs
      };

      resolve(data);

    });
  });

};
