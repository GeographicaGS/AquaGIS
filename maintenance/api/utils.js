'use strict';

const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;
const utils = require('../../utils.js');
const fs = require('fs');
const log = utils.log();

var decodeBase64Image = function (dataString) {
  var matches = dataString.match(/^data:[A-Za-z-+]+\/([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

var writeFile = function (path, contents, cb) {
  mkdirp(getDirName(path), function (err) {
    if (err) return cb(err);
    fs.writeFile(path, contents, cb);
  });
}

var randomString = function() {
  var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 12;
  var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  if (typeof length !== 'number') throw new Error('length must be a number');
  if (typeof scope !== 'string') throw new Error('scope must be a string');
  var str = '';
  var l = scope.length;

  for (var i = 0; i < length; i++) {
    str += scope.charAt(Math.floor(Math.random() * l));
  }

  return str;
}


module.exports.decodeBase64Image = decodeBase64Image;
module.exports.writeFile = writeFile;
module.exports.randomString = randomString;
