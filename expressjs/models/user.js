/**
 * User Model Definition.
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

var UserSchema = new Schema({
  password:       { type: String },
  last_login:     { type: Date },
  realm:          { type: String, default: 'user' },
  role:           { type: String, default: 'consumer' },
  archived:       { type: Boolean, default: false },
  date_created:   { type: Date },
  last_modified:  { type: Date }
});

/**
 * Model attributes to expose
 */
UserSchema.statics.whitelist = {
  _id: 1,
  last_login: 1,
  role:   1
};

// add mongoose-troop middleware to support pagination
UserSchema.plugin(paginator);

/**
 * Verify the submitted password and the stored one
 *
 * @param {String} password submitted password
 * @param {Function} cb Callback function
 */
UserSchema.methods.verifyPassword = function verifyPassword(passwd, cb) {
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
UserSchema.pre('save', function preSave(next) {
  var model = this;

  // Hash Password
  UserSchema.statics.hashPasswd(model.password, function(err, hash) {
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

UserSchema.statics.hashPasswd = function (passwd, cb) {
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

// Expose the User Model
module.exports = mongoose.model('User', UserSchema);
