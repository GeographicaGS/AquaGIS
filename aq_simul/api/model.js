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

    var bbox_filter = opts.bbox ? `AND (a.position && ST_MakeEnvelope('${opts.bbox[0]}','${opts.bbox[1]}','${opts.bbox[2]}','${opts.bbox[3]}', 4326) OR a.position IS NULL)` : '';

    let sql_1 = `
      SELECT b.type_name, COUNT(a.type_name)
      FROM ${opts.scope}.aq_cata_const_simulation a
      RIGHT JOIN ${opts.scope}.aq_cata_const_type b 
      ON a.type_id=b.type_id
      AND a.type_name=b.type_name
      WHERE TRUE ${bbox_filter}
      GROUP BY b.type_name;
    `;

    let sql_2 = `
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

    var promises = [this.promise_query(sql_1), this.promise_query(sql_2)];
    return Promise.all(promises)
    .then((data) => {

      var classified = {};
        for (var i = 0; i < data[1].rows.length; i++) {
          if (Object.keys(classified).includes(data[1].rows[i].type_name)) {
            var key = data[1].rows[i].type_name;
            delete data[1].rows[i].type_name;
            classified[key].push(data[1].rows[i]);
          } else {
            var key = data[1].rows[i].type_name;
            delete data[1].rows[i].type_name;
            classified[key] = [data[1].rows[i]];
          }
        }

      var response = []
      for (var i = 0; i < data[0].rows.length; i++) {
        var type = {
          'type_name': data[0].rows[i].type_name,
          'count' : data[0].rows[i].count,
          'rows' : classified[data[0].rows[i].type_name]
        };
        response.push(type);
      }

      return Promise.resolve(response);

    }).catch(function(err) {
      return Promise.reject(err);
    });

  }

  getMap(opts) {

    let sql = `
    SELECT Q2.id_entity, geometry, consumption, calibre, tipo, n_personas FROM
    ( SELECT id_entity, ST_AsGeoJSON(position) AS geometry
      FROM ${opts.scope}.aq_cons_plot) Q1
    LEFT JOIN
    ( SELECT id_entity,
             sum(consumption) as consumption
     FROM ${opts.scope}.aq_cons_plot_agg_hour
     WHERE "TimeInstant" >= '${opts.start}'::TIMESTAMP
         AND "TimeInstant" < '${opts.finish}'::TIMESTAMP
     GROUP BY id_entity) Q2 ON Q1.id_entity = Q2.id_entity
    LEFT JOIN
    (SELECT id_entity,
            calibre,
            tipo,
            n_personas
     FROM ${opts.scope}.aq_cata_plot_simulation) Q3 ON Q2.id_entity = Q3.id_entity;
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
