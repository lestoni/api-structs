/**
 * Resource resourcer.
 *
 * @summary
 *  resource.create()
 *  resource.update()
 *  resource.delete()
 *  resource.fetchOne()
 *  resource.fetchAll()
 */

/**
 * Load Module Dependencies.
 */
var express  = require('express');
var debug    = require('debug')('api:resource-resourcer');

var resourceController = require('../controllers/resource');

var resourcer  = express.Resourcer();

/**
 * @api {post} /resources/create Create a resource
 * @apiVersion 1.0.0
 * @apiName Create
 * @apiGroup Resource
 *
 * @apiDescription Create a new resource.
 *
 * @apiParam {String} name name of the resource
 *
 * @apiParamExample Request Example:
 *  {
 *    "name": "Jumia Online Shop"
 *  }
 *
 * @apiSuccess {String} _id resource id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 *
 */
resourcer.post('/create', resourceController.create);

/**
 * @api {get} /resources/:id Get Resource
 * @apiVersion 1.0.0
 * @apiName Get
 * @apiGroup Resource
 *
 * @apiDescription Get a resource with the given id
 *
 */
resourcer.get('/:id', accessControl(['resource', 'admin']), resourceController.fetchOne);

/**
 * @api {put} /resources/:id Update Resource
 * @apiVersion 1.0.0
 * @apiName Update
 * @apiGroup Resource
 *
 * @apiDescription Update a resource with the given id
 *
 * @apiSuccess {String} _id resource id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 *
 */
resourcer.put('/:id', accessControl(['resource', 'admin']), resourceController.update);

/**
 * @api {get} /resources/paginate?page=<RESULTS_PAGE>&per_page=<RESULTS_PER_PAGE> Get resources collection
 * @apiVersion 1.0.0
 * @apiName FetchAllByPagination
 * @apiGroup Resource
 *
 * @apiDescription Get a collection of resources. The endpoint has pagination
 * out of the box. Use these params to query with pagination: `page=<RESULTS_PAGE`
 * and `per_page=<RESULTS_PER_PAGE>`.
 *
 * @apiSuccess {String} _id resource id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "total_pages": 1,
 *    "total_docs_count": 0,
 *    "docs": [{
 *      "_id" : "556e1174a8952c9521286a60"
 *    }]
 *  }
 *
 */
resourcer.get('/paginate', accessControl('admin'), resourceController.fetchAllByPagination);

/**
 * @api {get} /resources Get resources collection
 * @apiVersion 1.0.0
 * @apiName FetchAll
 * @apiGroup Resource
 *
 * @apiDescription Get a collection of resources.
 *
 * @apiSuccess {String} _id resource id
 *
 * @apiSuccessExample Response Example:
 *  [{
 *      "_id" : "556e1174a8952c9521286a60"
 *  }]
 *
 */
resourcer.get('/', accessControl('admin'), resourceController.fetchAll);

/**
 * @api {delete} /resources/:id Delete Resource
 * @apiVersion 1.0.0
 * @apiName Delete
 * @apiGroup Resource
 *
 * @apiDescription Delete a resource with the given id
 *
 * @apiSuccess {String} _id resource id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 *
 */
resourcer.delete('/:id', accessControl('admin'), resourceController.delete);

// Expose Resource Resourcer
module.exports = resourcer;
