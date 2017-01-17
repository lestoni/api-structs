/**
 * Load Module Dependencies
 */
var debug   = require('debug')('api:construct-mongodb-update');
var moment  = require('moment');
var _       = require('lodash');
var emquery = require('emquery');

module.exports = function construct(data) {
  data = data || {};

  var keys = Object.keys(data);
  var now = moment().toISOString();
  var update = {
    $set: {}
  };
  var $set = update.$set;

  $set.last_modified = now;

  keys.forEach(function (key) {
    var value = data[key];

    if (_.isArray(value)) {
      update.$push = update.$push || {};

      update.$push[key] = value;

    } else if (_.isPlainObject(value)) {
      var _temp = {};
      _temp[key] = value;
      var _obj = emquery(_temp);
      var _keys = Object.keys(_obj);

      _keys.forEach(function (item) {
        $set[item] = _obj[item];
      });

    } else {
      $set[key] = value;

    }

  });


  return update;
};
