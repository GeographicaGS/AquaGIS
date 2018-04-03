'use strict';

var plotConstructionsValidator = function (req, res, next) {
  return next();
};

var tankPlansValidator = function(req, res, next) {
  req.checkBody('time', 'date, required').notEmpty().isDate();
  return next();
};

module.exports.plotConstructionsValidator = plotConstructionsValidator;
module.exports.tankPlansValidator = tankPlansValidator;