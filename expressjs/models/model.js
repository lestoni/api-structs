// Model Model Definiton.

/**
 * Load Module Dependencies.
 */
var mongoose  = require('mongoose');
var moment    = require('moment');
var paginator = require('mongoose-paginate');

var Schema = mongoose.Schema;

var ModelSchema = new Schema({
  date_created:   { type: Date },
  last_modified:  { type: Date }
});

// add mongoose-troop middleware to support pagination
ModelSchema.plugin(paginator);

/**
 * Pre save middleware.
 *
 * @desc  - Sets the date_created and last_modified
 *          attributes prior to save.
 *        - Hash tokens password.
 */
ModelSchema.pre('save', function preSaveMiddleware(next) {
  var token = this;

  // set date modifications
  var now = moment().toISOString();

  token.date_created = now;
  token.last_modified = now;

  next();

});

/**
 * Model Attributes to expose
 */
ModelSchema.statics.whitelist = {
  _id: 1,
  date_created:   1
};


// Expose Model model
module.exports = mongoose.model('Model', ModelSchema);
