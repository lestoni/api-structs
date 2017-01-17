'use strict';
/**
 * Load Module Dependencies
 */

const ERROR_CODES = {
  AUTHENTICATION_ERROR: {
    message: 'User not Authenticated',
    status: 401
  },
  DEFAULT_ERROR: {
    message : 'Something Went Wrong ☹ ',
    status: 400
  },
  SERVER_ERROR: {
    message: 'Internal Server Error',
    status: 500
  },
  LOGOUT_ERROR: {
    message: 'You are not Logged in',
    status: 400
  },
  AUTHORIZATION_ERROR: {
    message: 'You are not authorized to perform this action',
    status: 403
  },
  USER_CREATION_ERROR: {
    message: 'User cannot be created',
    status: 400
  },
  PASSWORD_UPDATE_ERROR: {
    message: 'Could not update password for the user',
    status: 400
  }
};

/**
 * CustomError Type Definition
 */

class CustomError extends Error {
  constructor(info) {
    let _knownError = ERROR_CODES[info.type] || ERROR_CODES.DEFAULT_ERROR;

    super(info.message ? info.message : _knownError.message);

    this.type    = info.type || 'DEFAULT_ERROR';
    this.status  = _knownError ? _knownError.status : (info.status ? info.status : 400);
  }
}

// Expose Constructor
module.exports = CustomError;
