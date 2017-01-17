/**
 * User router.
 *
 * @summary
 *  user.create()
 *  user.update()
 *  user.delete()
 *  user.fetchOne()
 *  user.fetchAll()
 */

/**
 * Load Module Dependencies.
 */
var express  = require('express');
var debug    = require('debug')('api:user-router');

var userController = require('../controllers/user');
var authController = require('../controllers/auth');
var accessControl  = require('../controllers/auth').accessControl;

var router  = express.Router();

/**
 * @api {post} /users/signup Create a user
 * @apiVersion 1.0.0
 * @apiName Signup
 * @apiGroup User
 *
 * @apiDescription Create a new user
 *
 * @apiParam {String} password Password/Pin
 *
 * @apiParamExample Request Example:
 *  {
 *    "password": "pin"
 *  }
 *
 * @apiSuccess {String} _id user id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 *
 */
router.post('/signup', userController.create);

/**
 * @api {post} /users/login Login a user
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup User
 *
 * @apiDescription Log in a user. The request returns a token used to authentication
 * of the user on subsequent requests. The token is placed as an HTTP header ie
 * ```Authorization: Bearer <Token-here>``` otherwise requests are rejected.
 *
 * @apiParam {String} password Password/Pin
 *
 * @apiParamExample Request Example:
 *  {
 *    "password": "mypin"
 *  }
 *
 * @apiSuccess {String} token auth token
 * @apiSuccess {Object} user user info
 * @apiSuccess {String} user._id user id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "token" : "ylHUMaVrS0dpcO/+nT+6aAVVGcRJzu=",
 *    "user": {
 *      "_id" : "556e1174a8952c9521286a60"
 *    }
 *  }
 *
 */
router.post('/login', authController.login);

/**
 * @api {post} /users/logout Logout a user
 * @apiVersion 1.0.0
 * @apiName Logout
 * @apiGroup User
 *
 * @apiDescription Invalidate a users token
 *
 * @apiSuccess {Boolean} logged_out message
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "logged_out" : true
 *  }
 *
 */
router.post('/logout', authController.logout);


/**
 * @api {get} /users/:id Get User
 * @apiVersion 1.0.0
 * @apiName Get
 * @apiGroup User
 *
 * @apiDescription Get a user with the given id
 *
 * @apiSuccess {String} _id user id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 */
router.get('/:id', accessControl(['consumer', 'admin']), userController.fetchOne);

/**
 * @api {put} /users/:id Update User
 * @apiVersion 1.0.0
 * @apiName Update
 * @apiGroup User
 *
 * @apiDescription Update a user with the given id
 *
 * @apiSuccess {String} _id user id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 */
router.put('/:id', accessControl(['consumer', 'admin']), userController.update);

/**
 * @api {get} /users/paginate?page=<RESULTS_PAGE>&per_page=<RESULTS_PER_PAGE> Get users collection
 * @apiVersion 1.0.0
 * @apiName FetchPaginated
 * @apiGroup User
 *
 * @apiDescription Get a collection of users. The endpoint has pagination
 * out of the box. Use these params to query with pagination: `page=<RESULTS_PAGE`
 * and `per_page=<RESULTS_PER_PAGE>`.
 *
 * @apiSuccess {String} _id user id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "total_pages": 1,
 *    "total_docs_count": 0,
 *    "docs": [{
 *      "_id" : "556e1174a8952c9521286a60",
 *    }]
 *  }
 */
router.get('/', accessControl(['admin']), userController.fetchAllByPagination);

/**
 * @api {get} /users Get users collection
 * @apiVersion 1.0.0
 * @apiName FetchAll
 * @apiGroup User
 *
 * @apiDescription Get a collection of users.
 *
 * @apiSuccess {String} _id user id
 *
 * @apiSuccessExample Response Example:
 *  [{
 *      "_id" : "556e1174a8952c9521286a60",
 *  }]
 */
router.get('/', accessControl(['admin']), userController.fetchAll);

/**
 * @api {delete} /users/:id Delete User
 * @apiVersion 1.0.0
 * @apiName Delete
 * @apiGroup User
 *
 * @apiDescription Delete a user with the given id
 *
 * @apiSuccess {String} _id user id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 *
 */
router.delete('/:id', accessControl(['consumer', 'admin']), userController.delete);

/**
 * @api {delete} /users/:id/Archive Delete User
 * @apiVersion 1.0.0
 * @apiName Delete
 * @apiGroup User
 *
 * @apiDescription Archive a user with the given id
 *
 * @apiSuccess {String} _id user id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 *
 */
router.post('/:id/archive', accessControl(['consumer', 'admin']), userController.archive);

/**
 * @api {put} /users/password/update Update user password/pin
 * @apiVersion 1.0.0
 * @apiName UpdatePassword
 * @apiGroup User
 *
 * @apiDescription Update password of a given user.
 *
 * @apiParam {String} security_question_answer security question answer
 * @apiParam {String} phone_number phone number
 * @apiParam {String} new_password new password/pin
 *
 * @apiParamExample Request Example:
 * {
 *    "security_answer" : "john doey",
 *    "phone_number" : "0713510521"
 *    "new_password": "2654"
 * }
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "updated": true
 *  }
 */
router.post('/password/update', userController.updatePassword);


// Expose User Router
module.exports = router;
