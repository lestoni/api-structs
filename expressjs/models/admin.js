/**
 * Admin Model Definition.
 */

/**
 * Load Module Dependencies.
 */
var mongoose  = require('mongoose');
var moment    = require('moment');
var paginator = require('mongoose-paginate');
var bcrypt    = require('bcrypt');

var config    = require('../config');

var Schema = mongoose.Schema;

var AdminSchema = new Schema({
  first_name:   { type: String },
  last_name:    { type: String },
  password:     { type: String },
  last_login:   { type: Date },
  realm:        { type: String, default: 'internal' },
  role:         { type: String, default: 'admin' },
  email:        { type: String  },
  date_created: Date,
  last_modified:Date
});

/**
 * Model attributes to expose
 */
AdminSchema.statics.whitelist = {
  _id: 1,
  first_name: 1,
  last_name: 1,
  last_login: 1,
  role:   1,
  email: 1
};

// add mongoose-troop middleware to support pagination
AdminSchema.plugin(paginator);

/**
 * Verify the submitted password and the stored one
 *
 * @param {String} password submitted password
 * @param {Function} cb Callback function
 */
AdminSchema.methods.verifyPassword = function verifyPassword(passwd, cb) {
  bcrypt.compare(passwd, this.password, function done(err, isMatch) {
    if(err) {
      return cb(err);
    }

    cb(null, isMatch);
  });
};

/**
 * Pre save middleware.
 *
 * Sets the date_created and last_modified attributes prior to save
 */
AdminSchema.pre('save', function preSave(next) {
  var model = this;

  // Hash Password
  AdminSchema.statics.hashPasswd(model.password, function(err, hash) {
    if(err) {
      return next(err);
    }

    // set date modifications
    var now = moment().toISOString();

    model.password = hash;

    model.date_created = now;
    model.last_modified = now;
    next();

  });

});

AdminSchema.statics.hashPasswd = function (passwd, cb) {
  // Generate a salt factor
  bcrypt.genSalt(config.SALT_FACTOR, function genSalt(err, salt) {
    if(err) {
      return cb(err);
    }

    // Hash the password using the generated salt
    bcrypt.hash(passwd, salt, function hashPassword(err, hash) {
      if(err) {
        return cb(err);
      }

      cb(null, hash);

    });

  });
};

// Expose the Admin Model
module.exports = mongoose.model('Admin', AdminSchema);
