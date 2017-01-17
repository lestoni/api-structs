'use strict';
// Model model Definiton.

/**
 * Load Module Dependencies.
 */
const mongoose  = require('mongoose');
const moment    = require('moment');
const paginator = require('mongoose-paginate');

var Schema = mongoose.Schema;

// New Model Schema model
var ModelSchema = new Schema({
  date_created:   { type: Date },
  last_modified:  { type: Date }
});

/**
 * Model Attributes to expose
 */
ModelSchema.statics.attributes = {
  date_created:   1,
  last_modified: 1
};

// Add middleware to support pagination
ModelSchema.plugin(paginator);

/**
 * Pre save middleware.
 *
 * @desc  - Sets the date_created and last_modified
 *          attributes prior to save.
 */
ModelSchema.pre('save', function preSaveMiddleware(next) {
  let model = this;

  // set date modifications
  let now = moment().toISOString();

  model.date_created = now;
  model.last_modified = now;

  next();

});


// Expose Model model
module.exports = mongoose.model('Model', ModelSchema);
