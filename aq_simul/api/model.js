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

const MetadataInstanceModel = require('../../models/metadatainstancemodel.js');
const GeoJSONFormatter = require('../../protools/geojsonformatter.js');
const PGSQLModel = require('../../models/pgsqlmodel.js');
const utils = require('../../utils.js');
var _ = require('underscore');

const log = utils.log();

class AqSimulModel extends PGSQLModel {
  constructor(cfg) {
    super(cfg);
  }

  get this() {
    return this;  // Because parent is not a strict class
  }

  getSimulationCount(opts) {

    if (opts.bbox) {
      var bbox_filter = 'AND (a.position && ST_MakeEnvelope('+opts.bbox+', 4326) OR a.position IS NULL)';
    }

    let sql1 = `
      SELECT b.type_name, COUNT(a.type_name)
      FROM ${opts.scope}.aq_cata_const_simulation a
      RIGHT JOIN ${opts.scope}.aq_cata_const_type b 
      ON a.type_id=b.type_id
      AND a.type_name=b.type_name
      GROUP BY b.type_name;
    `;

    let sql2 = `
      SELECT b.type_id,
             b.type_value,
             b.type_parameter,
             b.type_name,
             COUNT(a.type_id)
      FROM ${opts.scope}.aq_cata_const_simulation a
      RIGHT JOIN ${opts.scope}.aq_cata_const_type b
      ON a.type_id=b.type_id
      AND a.type_name=b.type_name
      WHERE TRUE ${bbox_filter}
      GROUP BY b.type_id,
               b.type_value,
               b.type_parameter,
               b.type_name;
    `;

    var parent = this;
    return this.promise_query(sql1)
    .then(function (data1) {
      return parent.promise_query(sql2)
      .then(function (data2) {
        var classified = {};
        for (var i = 0; i < data2.rows.length; i++) {
          if (Object.keys(classified).includes(data2.rows[i].type_name)) {
            var key = data2.rows[i].type_name;
            delete data2.rows[i].type_name;
            classified[key].push(data2.rows[i]);
          } else {
            var key = data2.rows[i].type_name;
            delete data2.rows[i].type_name;
            classified[key] = [data2.rows[i]];
          }
        }

        var response = []
        for (var i = 0; i < data1.rows.length; i++) {
          var type = {
            'type_name': data1.rows[i].type_name,
            'count' : data1.rows[i].count,
            'rows' : classified[data1.rows[i].type_name]
          };
          response.push(type);
        }

        return Promise.resolve(response);
      }).catch(function(err2) {
        return Promise.reject(err2);
      });
    }).catch(function(err1) {
      return Promise.reject(err1);
    });

  }

  getMap(opts) {

    let sql = `
    SELECT agg.id_entity,
       ST_AsGeoJSON(cat.position) AS geometry,
       SUM(consumption) AS consumption,
       calibre,
       tipo,
       n_personas
    FROM ${opts.scope}.aq_cons_plot_agg_hour agg
    INNER JOIN ${opts.scope}.aq_cata_plot_simulation sim ON agg.id_entity=sim.id_entity
    INNER JOIN ${opts.scope}.aq_cons_plot cat ON agg.id_entity=cat.id_entity
    WHERE agg."TimeInstant" >= '${opts.start}'::timestamp AND agg."TimeInstant" < '${opts.finish}'::timestamp
    GROUP BY agg.id_entity,
             cat.position,
             calibre,
             tipo,
             n_personas
    ORDER BY id_entity;
    `;

    return this.promise_query(sql)
    .then(function(data) {
      data = new GeoJSONFormatter().featureCollection(data.rows);
      return Promise.resolve(data);
    })
    .catch(function(err) {
      return Promise.reject(err);
    });

  }

}

module.exports = AqSimulModel;
