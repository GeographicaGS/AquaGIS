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

const AqConsModel = require('./model.js');
const express = require('express');
const utils = require('../../utils.js');
var _ = require('underscore');
var check = require('./check.js');
const router = express.Router();
const log = utils.log();

router.get('/plot/:id_plot/constructions', check.plotConstructionsValidator, function(req, res, next) {
  var opts = {
    scope: req.scope,
    id_plot: req.params.id_plot
  };

  new AqConsModel().getPlotConstructions(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});


router.post('/tank/:tank_id/plans', check.tankPlansValidator, function(req, res, next) {
  var opts = {
    scope: req.scope,
    id_entity: req.params.tank_id,
    time: req.body.time
  };

  var activationsTime;
  var aqConsModel = new AqConsModel();

  aqConsModel.getTankActivationHours(opts)
  .then(function(data) {
    activationsTime = data;
    var emergency = false

    if (_.some(_.map(activationsTime, function(element) {return element['emergency']}))) {
      emergency = true;
    }

    aqConsModel.getPlansStatistics(opts, emergency)
    .then(function(data) {
      data['activations'] = activationsTime

      res.json(data)
    });

  })
  .catch(function(err) {
    next(err);
  });
});

router.post('/entities/aq_cons.sector/elements', function(req, res, next) {
  var opts = {
    scope: req.scope,
    id_entity: req.params.tank_id,
    time: req.body.time
  };

  var aqConsModel = new AqConsModel();

  aqConsModel.getEntitiesElements(opts)
  .then(function(data) {
      res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});


module.exports = router;
