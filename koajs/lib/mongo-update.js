'use strict';
/**
 * Load Module Dependencies
 */
const debug   = require('debug')('api:mongodb-update');
const moment  = require('moment');
const _       = require('lodash');
const emquery = require('emquery');

module.exports = function construct(data) {
  data = data || {};

  let keys = Object.keys(data);
  let now = moment().toISOString();
  let update = {
    $set: {}
  };
  let $set = update.$set;

  $set.last_modified = now;

  for(let key of keys) {
    let value = data[key];

    if (_.isArray(value)) {
      update.$push = update.$push || {};

      update.$push[key] = value;

    } else if (_.isPlainObject(value)) {
      let _temp = {};
      _temp[key] = value;
      let _obj = emquery(_temp);
      let _keys = Object.keys(_obj);

      for(let item of _keys) {
        $set[item] = _obj[item];
      }

    } else {
      $set[key] = value;

    }
  }

  return update;
};
