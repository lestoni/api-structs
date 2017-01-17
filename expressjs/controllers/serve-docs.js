/**
 * Load Module Dependencies.
 *
 */
var path   = require('path');
var crypto = require('crypto');

var express    = require('express');
var debug      = require('debug')('api:serve-docs-router');
var bodyParser = require('body-parser');
var session    = require('express-session');

var config = require('../config');
var Admin = require('../models/admin');

var router = express.Router();
var index  = path.resolve(__dirname, '../documentation');
var docs   = path.resolve(__dirname, '../documentation/docs');

var KEY   = crypto.randomBytes(12).toString('base64');
var cache = {};

router.use(session({
  secret: config.DOCS.SECRET,
  saveUninitialized: true,
  resave:true
}));
router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(bodyParser.json());

router.use('/docs', function (req, res, next) {
  var admin = req.session._admin;
  var id = admin ? admin.id : null;
  var time = id ? cache[id] : Date.now();

  if(!id) {
    return res.redirect('/documentation');
  } else if(Date.now()  > time) {
    delete cache[id];
    req.session._admin = null;
    return res.redirect('/documentation');
  } else {
    return next();
  }
},express.static(docs));
router.use('/', function (req, res, next) {
  var admin = req.session._admin;
  var id = admin ? admin.id : null;
  var time = id ? cache[id] : Date.now();

  if(!id) {
    return next();
  } else if(Date.now()  > time) {
    delete cache[id];
    req.session._admin = null;
    return res.redirect('/documentation');
  } else {
    return res.redirect('/documentation/docs');
  }
}, express.static(index));

router.post('/login', function (req, res, next) {
  var body = req.body;

  if(!body.email && !body.password) {
    res.redirect('/documentation');
    return;
  } else {
    Admin.findOne({ email: body.email }, function (err, admin) {
      if(err || !admin) {
        return res.redirect('/documentation');
      }

      admin.verifyPassword(body.password, function (err, isMatch) {
        if(err || !isMatch) {
          return res.redirect('/documentation');
        }

        var TIMEOUT = Date.now() + (30 * 60 * 1000);
        req.session._admin = { id: admin._id };
        cache[admin._id] = TIMEOUT;

        res.redirect('/documentation/docs');
        return;
      });
    });
  }
});

module.exports = router;
