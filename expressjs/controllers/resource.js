/** *
 * Load Module Dependencies.
 */
var EventEmitter = require('events').EventEmitter;

var debug      = require('debug')('api:resource-controller');
var async      = require('async');
var moment     = require('moment');
var _          = require('lodash');

var config          = require('../config');
var CustomError     = require('../lib/custom-error');


/**
 * Create a resource.
 *
 * @desc create a resource and add them to the database
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.create = function createResource(req, res, next) {
  debug('create resource');

  // Begin workflow
  var workflow = new EventEmitter();
  var body = req.body;

  // validating resource data
  // cant trust anyone
  workflow.on('validate', function validateResource() {

    var errs = req.validationErrors();

    if(errs) {
      return next(CustomError({
        name: 'RESOURCE_CREATION_ERROR',
        message: errs.message
      }));
    }

    workflow.emit('createResource');
  });

  workflow.on('createResource', function createResource() {
    var verificationLink;


    Resource.create(body, function (err, resource) {
      if(err) {
        return next(CustomError({
          name: 'RESOURCE_CREATION_ERROR',
          message: err.message
        }));
      }


      workflow.emit('completeRegistration', resource);

    });


  });


  workflow.on('completeRegistration', function (resource) {

    res.status(201).json(resource);
  });

  workflow.emit('validate');
};

/**
 * Get a single resource.
 *
 * @desc Fetch a resource with the given id from the database.
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.fetchOne = function fetchOneResource(req, res, next) {
  debug('fetch resource:' + req.params.id);

  var query = {
    _id: req.params.id
  };

  Resource.get(query, function cb(err, resource) {
    if(err) {
      return next(CustomError({
        name: 'SERVER_ERROR',
        message: err.message,
        status: 500
      }));
    }

    res.json(resource);
  });
};

/**
 * Update a single resource.
 *
 * @desc Fetch a resource with the given id from the database
 *       and update their data
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.update = function updateResource(req, res, next) {
  debug('updating resource:'+ req.params.id);

  var query = {
    _id: req.params.id
  };
  var body = req.body;

  Resource.update(query, body, function cb(err, resource) {
    if(err) {
      return next(CustomError({
        name: 'SERVER_ERROR',
        message: err.message
      }));
    }

    res.json(resource);

  });

};

/**
 * Delete/Archive a single resource.
 *
 * @desc Fetch a resource with the given id from the database
 *       and delete their data
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.delete = function deleteResource(req, res, next) {
  debug('deleting resource:' + req.params.id);

  var query = {
    _id: req.params.id
  };

  Resource.delete(query, function cb(err, resource) {
    if(err) {
      return next(CustomError({
        name: 'SERVER_ERROR',
        message: err.message
      }));
    }


    res.json(resource);

  });

};

/**
 * Get a collection of resources with pagination
 *
 * @desc Fetch a collection of resources
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAllByPagination = function fetchAllresources(req, res, next) {
  debug('get a collection of resources');

  var page   = req.query.page || 1;
  var limit  = req.query.per_page || 10;

  var opts = {
    page: page,
    limit: limit,
    sort: { }
  };
  var query = {};

  Resource.getCollectionByPagination(query, opts, function cb(err, resources) {
    if(err) {
      return next(CustomError({
        name: 'SERVER_ERROR',
        message: err.message
      }));
    }

    res.json(resources);
  });
};

/**
 * Get a collection of resources
 *
 * @desc Fetch a collection of resources
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAll = function fetchAllresources(req, res, next) {
  debug('get a collection of resources');

  var query = {};
  var opts = {};

  Resource.getCollection(query, opts, function cb(err, resourcesStream) {
    if(err) {
      return next(CustomError({
        name: 'SERVER_ERROR',
        message: err.message
      }));
    }

    res.setHeader('Content-Type', 'application/json');

    resourcesStream.pipe(res);
  });
};
