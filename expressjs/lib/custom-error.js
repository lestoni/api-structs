/**
 * Load Module Dependencies
 */

var ERROR_CODES = {
  AUTHENTICATION_ERROR: {
    message: 'User not Authenticated',
    status: 401
  },
  DEFAULT_ERROR: {
    message : 'Something Went Wrong ☹ ",
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
    status 400
  },
  PASSWORD_UPDATE_ERROR: {
    message: 'Could not update password for the user',
    status: 400
  }
};

/**
 * CustomError Type Definition.
 *
 * @param {Object} info error information
 *
 */
function CustomError(info) {
  if(!(this instanceof CustomError)) {
    return new CustomError(info);
  }

  var _knownError = ERROR_CODES[info.name];

  this.name    = info.name || 'DEFAULT_ERROR';
  this.message = _knownError ? _knownError.message : info.message;
  this.status  = _knownError ? _knownError.status : (info.status ? info.status : 400);
}

CustomError.prototype = Object.create(Error.prototype);

CustomError.prototype.constructor = CustomError;

// Expose Constructor
module.exports = CustomError;
