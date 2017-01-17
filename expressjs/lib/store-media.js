/**
 * Load Module Dependencies
 */
var fs = require('fs');

var debug   = require('debug')('api:store-media-files');
var mkdirp  = require('mkdirp');

var config      = require('../config');
var CustomError = require('./custom-error');

module.exports = function storeMediaFiles(options) {
  options = options || {};

  return function (req, res, next) {
    var body = {};
    var errors = {
      present: false
    };

    if(req.busboy) {
      req.busboy.on('file', handleFileTypes);

      req.busboy.on('field', handleFieldTypes);

      req.busboy.on('finish', onFinish);
    } else {
      return next();
    }

    function handleFileTypes (fieldName, file, fileName, encoding, mimetype) {
      mkdirp(config.MEDIA.FILES_FOLDER, function done(err) {
        if(err) {
          return next(CustomError({
            name: 'FILE_UPLOAD_ERROR',
            message: err.message,
            status: 500
          }));
        }

        var saveToPath = config.MEDIA.FILES_FOLDER + fileName;

        file.pipe(fs.createWriteStream(saveToPath));

        file.on('limit', function () {
          errors.present = true;
          errors.info = {
            name: 'FILE_UPLOAD_ERROR',
            message: 'File Uploaded is too large: ' + fileName,
            status: 400
          };
        });

        file.on('error', function (info) {
          errors.present = true;
          errors.info = {
            name: 'FILE_UPLOAD_ERROR',
            message: 'Error while uploading ' + fileName,
            status: 500
          };
        });

        file.on('end', function onFinish() {
          body[fieldName] = config.MEDIA.URL + fileName;
        });
      });


    }

    function handleFieldTypes(fieldName, val, fieldNameTruncated, valTruncated) {
      body[fieldName] = val;
    }

    function onFinish() {
      debug('Done parsing request from: ' + req.url);

      if(errors.present) {
        return next(CustomError(errors.info));
      }

      req.body = body;

      next();

    }
  };
};
