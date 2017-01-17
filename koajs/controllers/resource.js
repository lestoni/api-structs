'use strict';
/** *
 * Load Module Dependencies.
 */
const debug      = require('debug')('api:resource-controller');
const moment     = require('moment');
const jsonStream = require('streaming-json-stringify');

const config          = require('../config');
const CustomError     = require('../lib/custom-error');
const ResourceDal     = require('./dal/model');

/**
 * Create a resource.
 *
 * @desc create a resource and add them to the database
 *
 * @param {Function} next Middleware dispatcher
 */
exports.create = function* createResource(next) {
  debug('create resource');

  // Begin workflow
  let body = this.request.body;

  if(this.errors) {
    return this.throw(new CustomError({
      type: 'RESOURCE_CREATION_ERROR',
      message: this.errors
    }));
  }

  try {
    let resource = yield ResourceDal.create(body);

    this.status = 201;
    this.body = resource;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'RESOURCE_CREATION_ERROR',
      message: ex.message
    }));
  }

};

/**
 * Get a single resource.
 *
 * @desc Fetch a resource with the given id from the database.
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchOne = function* fetchOneResource(next) {
  debug(`fetch resource:${this.params.id}`);

  let query = {
    _id: this.params.id
  };

  try {
    let resource = yield ResourceDal.get(query);

    this.body = resource;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'SERVER_ERROR',
      message: ex.message
    }));

  }

};

/**
 * Update a single resource.
 *
 * @desc Fetch a resource with the given id from the database
 *       and update their data
 *
 * @param {Function} next Middleware dispatcher
 */
exports.update = function* updateResource(next) {
  debug(`updating resource: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  try {
    let resource = yield ResourceDal.update(query, body);

    this.body = resource;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'SERVER_ERROR',
      message: ex.message
    }));

  }

};

/**
 * Delete/Archive a single resource.
 *
 * @desc Fetch a resource with the given id from the database
 *       and delete their data
 *
 * @param {Function} next Middleware dispatcher
 */
exports.delete = function* deleteResource(next) {
  debug(`deleting resource: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };

  try {
    let resource = yield ResourceDal.delete(query);

    this.body = resource;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'SERVER_ERROR',
      message: ex.message
    }));

  }

};

/**
 * Get a collection of resources with pagination
 *
 * @desc Fetch a collection of resources
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAllByPagination = function* fetchAllresources(next) {
  debug('get a collection of resources');

  let page   = req.query.page || 1;
  let limit  = req.query.per_page || 10;
  let query = {};
  let opts = {
    page: page,
    limit: limit,
    sort: { }
  };

  try {
    let resources = yield ResourceDal.getCollectionByPagination(query, opts);

    this.body = resources;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'SERVER_ERROR',
      message: ex.message
    }));

  }

};

/**
 * Get a collection of resources
 *
 * @desc Fetch a collection of resources
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAll = function* fetchAllresources(next) {
  debug('get a collection of resources');

  let query = {};
  let opts = {};

  try {
    let resourcesCollectionStream = yield ResourceDal.getCollection(query, opts);
    let stream;

    this.type = 'json';

    stream = this.body = resourcesCollectionStream.pipe(jsonStream());

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
