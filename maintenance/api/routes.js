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
const aq_maintenance_utils = require('./utils.js');
const router = express.Router();
const log = utils.log();
const request = require('request-promise')


router.get('/issues', function(req, res, next) {
  var opts = {
    scope: req.scope,
    start: req.query.start,
    finish: req.query.finish,
    type: req.query.type,
    assigned_user: req.query.assigned_user,
    status: req.query.status,
    issue_number: req.query.issue_number
  };

  new AqMaintenanceModel().getIssuesList(opts)
  .then(function(data) {
    res.json(data)

  })
  .catch(function(err) {
    next(err);
  });
});


router.get('/issues/types', function(req, res, next) {

  new AqMaintenanceModel().getIssuesTypes()
  .then(function(data) {
    let res_data =  [];
    data.forEach(function (arrayItem) {
      for (let value in arrayItem) {
        let val = { "id": arrayItem[value] };
        res_data.push(val);
      }
    });
    res.json(res_data);
  })
  .catch(function(err) {
    next(err);
  });

});


router.get('/issues/:id_issue', function(req, res, next) {
  var opts = {
    scope: req.scope,
    id: req.params.id_issue
  };

  new AqMaintenanceModel().getIssue(opts)
  .then(function(data) {

    res.json(data)

  })
  .catch(function(err) {
    next(err);
  });
});


router.post('/issues', function(req, res, next) {
  var opts = {
    scope: req.scope,
    id_entity: req.body.id_entity,
    type: req.body.type,
    budget: req.body.budget,
    address: req.body.address,
    position: req.body.position,
    description: req.body.description,
    assigned_user: req.body.assigned_user,
    estimated_time: req.body.estimated_time
  };

  var aqModel = new AqMaintenanceModel()
  aqModel.createIssue(opts)
  .then(function(data) {

    var status_opts = {
      scope: req.scope,
      id_issue: data[0].id,
      type: "registered",
      id_user: req.body.assigned_user
    };

    aqModel.createStatus(status_opts)
    .then(function(data) {

      var issue_opts = {
        scope: req.scope,
        issue_number: data[0].id_issue
      };

      aqModel.getIssuesList(issue_opts)
      .then(function(data) {

        let response = data

        // idDistribuidora and tipo hardcoded until we get more information
        let notification_options = {
          method: 'POST',
          uri: 'http://iatdev.isoin.es/aquasig-web/api/notificaciones/add',
          body: {
            "idDistribuidora" : "59db5a4700046e282e59c477",
            "asunto" : data.type,
            "contenido" : data.description,
            "tipo" : 2,
            "fechaInicio" : Math.round(new Date().getTime() / 1000),
            "coordenadas" : req.body.position
          },
          json: true
        };

        request(notification_options)
        .then(function (parsedBody) {
          res.json(response)
        })
        .catch(function (err) {
          next(err)
        });

      })

      .catch(function(err) {
        next(err);
      });

    })
    .catch(function(err) {
      next(err);
    });

  })
  .catch(function(err) {
    next(err);
  });

});


router.put('/issues', function(req, res, next) {
  var opts = {
    scope: req.scope,
    id: req.body.id,
    id_entity: req.body.id_entity,
    type: req.body.type,
    budget: req.body.budget,
    address: req.body.address,
    position: req.body.position,
    description: req.body.description,
    assigned_user: req.body.assigned_user,
    estimated_time: req.body.estimated_time
  };

  new AqMaintenanceModel().updateIssue(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});


router.delete('/issues', function(req, res, next) {
  var opts = {
    scope: req.scope,
    id: req.body.id
  };

  let aqModel = new AqMaintenanceModel()
  aqModel.deleteIssue(opts)
  .then(function(data) {

    var status_opts = {
      scope: req.scope,
      id_issue: data[0].id,
    };

    aqModel.deleteStatus(status_opts)
    .then(function(data) {

      res.json(data);

    })
    .catch(function(err) {
      next(err);
    });

  })
  .catch(function(err) {
    next(err);
  });

});


router.get('/status/types', function(req, res, next) {

  new AqMaintenanceModel().getStatusTypes()
  .then(function(data) {
    let res_data =  [];
    data.forEach(function (arrayItem) {
      for (let value in arrayItem) {
        let val = { "id": arrayItem[value] };
        res_data.push(val);
      }
    });
    res.json(res_data);
  })
  .catch(function(err) {
    next(err);
  });

});


router.get('/status/:id_issue', function(req, res, next) {
  var opts = {
    scope: req.scope,
    id_issue: req.params.id_issue
  };

  new AqMaintenanceModel().getStatusList(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});


router.post('/status', function(req, res, next) {
  var opts = {
    scope: req.scope,
    id_issue: req.body.id_issue,
    type: req.body.type,
    id_user: req.body.id_user
  };

  new AqMaintenanceModel().createStatus(opts)
  .then(function(data) {

    res.json(data);

    var issue_opts = {
      scope: req.scope,
      id: data[0].id_issue,
      current_status: req.body.type
    };

    new AqMaintenanceModel().updateIssueCurrentStatus(issue_opts)
    .then(function (issue_data) {
      res.json(data);
    })
    .catch(function (err) {
      next(err);
    });

  })
  .catch(function(err) {
    next(err);
  });

});


router.get('/files/:id_issue', function(req, res, next) {
  var opts = {
    scope: req.scope,
    id_issue: req.params.id_issue
  };

  new AqMaintenanceModel().getFilesList(opts)
  .then(function(data) {
    res.json(data)

  })
  .catch(function(err) {
    next(err);
  });
});


router.post('/files', function(req, res, next) {

    let promises = [];

    req.body.files.forEach(function (file) {

      var data = file.data;
      if (!file.name) {
        var name = aq_maintenance_utils.randomString();
      } else {
        var name = (file.name).replace(/ /g,"_");
      }
      var imageBuffer = aq_maintenance_utils.decodeBase64Image(data);
      var fullName = `${name}.${imageBuffer.type}`;
      var url = `uploads/${req.body.id_issue}/${fullName}`;
      aq_maintenance_utils.writeFile(url, imageBuffer.data);

      var opts = {
        scope: req.scope,
        id_issue: req.body.id_issue,
        id_user: req.body.id_user,
        name: fullName,
        name_ref: name,
        url: url
      };

      let promise = new AqMaintenanceModel().createFile(opts);
      promises.push(promise);

    });

    Promise.all(promises)
    .then(function(data) {
      res.json(data)

    })
    .catch(function(err) {
      next(err);
    });


});


router.delete('/files', function(req, res, next) {
  var opts = {
    scope: req.scope,
    id: req.body.id
  };

  new AqMaintenanceModel().deleteFile(opts)
  .then(function(data) {
    res.json(data)
  })
  .catch(function(err) {
    next(err);
  });
});


router.post('/address', function(req, res, next) {
  var opts = {
    position: req.body.position,
  };

  new AqMaintenanceModel().getAddress(opts.position)
  .then(function(data) {
    res.json(data[0]['display_name'])
  })
  .catch(function(err) {
    next(err);
  });
});







module.exports = router;
