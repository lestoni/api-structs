'use strict';

/**
 * Load Module Dependencies
 */
const Router = require('koa-router');
const debug  = require('debug')('api:app-router');

const userRouter     = require('./user');
const rootRouter     = require('./root');
const resourceRouter = require('./resource')

var appRouter = new Router();

const OPEN_ENDPOINTS = [
    /\/media\/.*/,
    /\/documentation\/.*/,
    '/users/login',
    '/users/signup',
    '/'
];

// Open Endpoints/Requires Authentication
appRouter.OPEN_ENDPOINTS = OPEN_ENDPOINTS;

// Add Users Router
appRouter.use('/users', userRouter.routes(), userRouter.allowedMethods());
// Add Resources Router
appRouter.use('/resources', resourceRouter.routes(), resourceRouter.allowedMethods());
// Add Root Router
appRouter.use('/', rootRouter.routes(), rootRouter.allowedMethods());


// Export App Router
module.exports = appRouter;
