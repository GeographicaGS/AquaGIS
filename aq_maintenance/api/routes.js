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

const AqMaintenanceModel = require('./model.js');
const express = require('express');
const utils = require('../../utils.js');
var _ = require('underscore');
var check = require('./check.js');
const router = express.Router();
const log = utils.log();

router.get('/:id_scope/maintenance/orders', function(req, res, next) {
  var opts = {
    scope: req.id_scope,
    start: req.query.start,
    finish: req.query.finish,
    type: req.query.type,
    assigned_user: req.query.assigned_user,
    state: req.query.assigned_user,
    order_number: req.query.order_number
  };

  new AqMaintenanceModel().getOrdersList(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});

router.get('/:id_scope/maintenance/orders', function(req, res, next) {
  var opts = {
    scope: req.id_scope,
    start: req.query.start,
    finish: req.query.finish,
    type: req.query.type,
    assigned_user: req.query.assigned_user,
    status: req.query.status,
    order_number: req.query.order_number
  };

  new AqMaintenanceModel().getOrdersList(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});

router.get('/:id_scope/maintenance/orders', function(req, res, next) {
  var opts = {
    scope: req.id_scope,
    start: req.query.start,
    finish: req.query.finish,
    type: req.query.type,
    assigned_user: req.query.assigned_user,
    status: req.query.status,
    order_number: req.query.order_number
  };

  new AqMaintenanceModel().getOrdersList(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});

router.post('/:id_scope/maintenance/orders', function(req, res, next) {
  var opts = {
  };

  new AqMaintenanceModel().createOrder(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});

router.put('/:id_scope/maintenance/orders', function(req, res, next) {
  var opts = {
  };

  new AqMaintenanceModel().updateOrder(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});

router.put('/:id_scope/maintenance/orders', function(req, res, next) {
  var opts = {
  };

  new AqMaintenanceModel().updateOrder(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});

router.delete('/:id_scope/maintenance/orders', function(req, res, next) {
  var opts = {
  };

  new AqMaintenanceModel().deleteOrder(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});

router.get('/:id_scope/maintenance/status', function(req, res, next) {
  var opts = {
  };

  new AqMaintenanceModel().getStatus(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});

router.post('/:id_scope/maintenance/status', function(req, res, next) {
  var opts = {
  };

  new AqMaintenanceModel().getStatus(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});

router.get('/:id_scope/maintenance/files/:id_order', function(req, res, next) {
  var opts = {
  };

  new AqMaintenanceModel().getFiles(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});

router.post('/:id_scope/maintenance/files', function(req, res, next) {
  var opts = {
  };

  new AqMaintenanceModel().createFile(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});

router.delete('/:id_scope/maintenance/files', function(req, res, next) {
  var opts = {
  };

  new AqMaintenanceModel().deleteFile(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});








module.exports = router;
