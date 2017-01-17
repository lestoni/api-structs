// Access Layer for Resource Data.

/**
 * Load Module Dependencies.
 */
var debug   = require('debug')('api:dal-resource');
var moment  = require('moment');
var _       = require('lodash');

var Resource    = require('../models/resource');
var Address     = require('../models/address');
var mongoUpdate = require('../lib/mongo-update');

var returnFields = Resource.whitelist;
var population = [];

/**
 * create a new resource.
 *
 * @desc  creates a new resource and saves them
 *        in the database
 *
 * @param {Object}  resourceData  Data for the resource to create
 * @param {Function} cb       Callback for once saving is complete
 */
exports.create = function create(resourceData, cb) {
  debug('creating a new resource');

  var searchQuery = { };

  // Make sure resource does not exist
  Resource.findOne(searchQuery, function resourceExists(err, isPresent) {
    if(err) {
      return cb(err);
    }

    if(isPresent) {
      return cb(new Error('Resource Already exists'));
    }


    // Create resource if is new.
    var resourceModel  = new Resource(resourceData);

    resourceModel.save(function saveResource(err, data) {
      if (err) {
        return cb(err);
      }


      exports.get({ _id: data._id }, function (err, resource) {
        if(err) {
          return cb(err);
        }

        cb(null, resource);

      });

    });

  });

};

/**
 * delete a resource
 *
 * @desc  delete data of the resource with the given
 *        id
 *
 * @param {Object}  query   Query Object
 * @param {Function} cb Callback for once delete is complete
 */
exports.delete = function deleteItem(query, cb) {
  debug('deleting resource: ', query);

  Resource
    .findOne(query, returnFields)
    .populate(population)
    .exec(function deleteResource(err, resource) {
      if (err) {
        return cb(err);
      }

      if(!resource) {
        return cb(null, {});
      }

      resource.remove(function(err) {
        if(err) {
          return cb(err);
        }

        cb(null, resource);

      });

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
 * @param {Function} cb Callback for once update is complete
 */
exports.update = function update(query, updates,  cb) {
  debug('updating resource: ', query);

  var now = moment().toISOString();
  var opts = {
    'new': true,
    select: returnFields
  };

  updates = mongoUpdate(updates);

  Resource
    .findOneAndUpdate(query, data, opts)
    .populate(population)
    .exec(function updateResource(err, resource) {
      if(err) {
        return cb(err);
      }

      cb(null, resource || {});
    });
};

/**
 * get a resource.
 *
 * @desc get a resource with the given id from db
 *
 * @param {Object} query Query Object
 * @param {Function} cb Callback for once fetch is complete
 */
exports.get = function get(query, cb) {
  debug('getting resource ', query);

  Resource
    .findOne(query, returnFields)
    .populate(population)
    .exec(function(err, resource) {
      if(err) {
        return cb(err);
      }

      cb(null, resource || {});
    });
};

/**
 * get a collection of resources
 *
 * @desc get a collection of resources from db
 *
 * @param {Object} query Query Object
 * @param {Function} cb Callback for once fetch is complete
 */
exports.getCollection = function getCollection(query, qs, cb) {
  debug('fetching a collection of resources');

  cb(null,
     Resource
      .find(query, returnFields)
      .populate(population)
      .stream({ transform: JSON.stringify }));

};

/**
 * get a collection of resources using pagination
 *
 * @desc get a collection of resources from db
 *
 * @param {Object} query Query Object
 * @param {Function} cb Callback for once fetch is complete
 */
exports.getCollectionByPagination = function getCollection(query, qs, cb) {
  debug('fetching a collection of resources');

  var opts = {
    columns:  returnFields,
    sortBy:   qs.sort || {},
    populate: population,
    page:     qs.page,
    limit:    qs.limit
  };


  Resource.paginate(query, opts, function (err, docs, page, count) {
    if(err) {
      return cb(err);
    }


    var data = {
      total_pages: page,
      total_docs_count: count,
      docs: docs
    };

    cb(null, data);

  });

};
