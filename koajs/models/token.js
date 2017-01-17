'use strict';
// Token Model Definiton.

/**
 * Load Module Dependencies.
 */
const mongoose  = require('mongoose');
const moment    = require('moment');

var Schema = mongoose.Schema;

// New Token Schema Instance
var TokenSchema = new Schema({
  value:          { type: String },
  revoked:        { type: Boolean, default: true },
  user:           { type: Schema.Types.ObjectId, ref: 'User' },
  date_created:   { type: Date },
  last_modified:  { type: Date }
});


/**
 * Pre save middleware.
 *
 * @desc  - Sets the date_created and last_modified
 *          attributes prior to save.
 *        - Hash tokens password.
 */
TokenSchema.pre('save', function preSaveMiddleware(next) {
  let token = this;

  // set date modifications
  let now = moment().toISOString();

  token.date_created = now;
  token.last_modified = now;

  next();

});

/**
 * Model Attributes to expose
 */
TokenSchema.statics.whitelist = {
  value: 1,
  revoked: 1,
  user: 1,
  date_created: 1
};


// Expose Token model
module.exports = mongoose.model('Token', TokenSchema);
