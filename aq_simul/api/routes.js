// Copyright 2017 Telefónica Digital España S.L.
//
// PROJECT: urbo-telefonica
//
// This software and / or computer program has been developed by
// Telefónica Digital España S.L. (hereinafter Telefónica Digital) and is protected as
// copyright by the applicable legislation on intellectual property.
//
// It belongs to Telefónica Digital, and / or its licensors, the exclusive rights of
// reproduction, distribution, public communication and transformation, and any economic
// right on it, all without prejudice of the moral rights of the authors mentioned above.
// It is expressly forbidden to decompile, disassemble, reverse engineer, sublicense or
// otherwise transmit by any means, translate or create derivative works of the software and
// / or computer programs, and perform with respect to all or part of such programs, any
// type of exploitation.
//
// Any use of all or part of the software and / or computer program will require the
// express written consent of Telefónica Digital. In all cases, it will be necessary to make
// an express reference to Telefónica Digital ownership in the software and / or computer
// program.
//
// Non-fulfillment of the provisions set forth herein and, in general, any violation of
// the peaceful possession and ownership of these rights will be prosecuted by the means
// provided in both Spanish and international law. Telefónica Digital reserves any civil or
// criminal actions it may exercise to protect its rights.

'use strict';

const AqSimulModel = require('./model.js');
const express = require('express');
const utils = require('../../utils.js');
var _ = require('underscore');

const router = express.Router();
const log = utils.log();

var bboxValidator = function (req, res, next) {
  req.checkBody('filters', 'A required Urbo\'s filters object').notEmpty();
  req.checkBody('filters.bbox', 'An optional array with the bounding box').optional().isArray();
  return next();
}

var timeValidator = function(req, res, next) {
  req.checkBody('time.start', 'date, required').notEmpty().isDate();
  req.checkBody('time.finish', 'date, required').notEmpty().isDate();
  return next();
}

router.post('/simulation/count', bboxValidator, function (req, res, next) {
  var opts = {
    scope: req.scope,
    bbox: req.body.filters.bbox
  };

  new AqSimulModel().getSimulationCount(opts)
  .then(function (data) {
    res.json(data);
  })
  .catch(function (error) {
    next(error);
  });

});

router.post('/map/historic', timeValidator, function (req, res, next) {
  var opts = {
    scope: req.scope,
    start: req.body.time.start,
    finish: req.body.time.finish
  }

  new AqSimulModel().getMap(opts)
  .then(function (data) {
    res.json(data);
  })
  .catch(function (error) {
    next(error);
  });

});

module.exports = router;
