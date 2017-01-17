'use strict';
/**
 * Resource resourcer.
 */

/**
 * Load Module Dependencies.
 */
const Router  = require('koa-router');
const debug   = require('debug')('api:resource-router');

const resourceController  = require('../controllers/resource');
const accessControl       = require('../controllers/auth').accessControl;

var router  = Router();

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
router.post('/create', resourceController.create);

/**
 * @api {get} /resources/:id Get Resource
 * @apiVersion 1.0.0
 * @apiName Get
 * @apiGroup Resource
 *
 * @apiDescription Get a resource with the given id
 *
 */
router.get('/:id', accessControl(['resource', 'admin']), resourceController.fetchOne);

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
router.put('/:id', accessControl(['resource', 'admin']), resourceController.update);

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
router.get('/paginate', accessControl('admin'), resourceController.fetchAllByPagination);

/**
 * @api {get} /resources/all Get resources collection
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
router.get('/all', accessControl('admin'), resourceController.fetchAll);

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
router.delete('/:id', accessControl('admin'), resourceController.delete);

// Expose Resource Router
module.exports = router;
