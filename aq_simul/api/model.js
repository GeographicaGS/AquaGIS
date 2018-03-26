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
      bbox_filter = 'AND b.position && ST_MakeEnvelope('+opts.bbox+', 4326)';
    }

    let sql = `
      SELECT type_name,
        count(type_name),
        (SELECT array_to_json(array_agg(DATA)) AS ROWS
         FROM
             ( SELECT a.type_id,
                      a.type_value,
                      c.type_parameter,
                      count(a.type_id)
              FROM ${opts.scope}.aq_cons_const_simulation a,
                   ${opts.scope}.aq_cata_const_type c
              WHERE a.type_name=b.type_name
                  AND a.type_name=c.type_name
                  AND a.type_value=c.type_value
              GROUP BY a.type_id,
                       a.type_value,
                       c.type_parameter
              ORDER BY a.type_id ) AS DATA)
    FROM ${opts.scope}.aq_cons_const_simulation b
    WHERE TRUE ${bbox_filter}
    GROUP BY type_name
    ORDER BY type_name ;
    `;

    return this.promise_query(sql)
    .then(function(data) {
      return Promise.resolve(data);
    })

    .catch(function(err) {
      return Promise.reject(err);
    });

  }

  getMap(opts) {

    let sql = `
    SELECT agg.id_entity,
       ST_AsGeoJSON(cat.position) AS geometry,
       SUM(consumption),
       calibre,
       tipo,
       n_personas
    FROM ${opts.scope}.aq_cons_plot_agg_hour agg
    INNER JOIN ${opts.scope}.aq_cons_plot_simulation sim ON agg.id_entity=sim.id_entity
    INNER JOIN ${opts.scope}.aq_cons_plot cat ON agg.id_entity=cat.id_entity
    WHERE agg."TimeInstant" >= ${opts.start} AND agg."TimeInstant" < ${opts.finish}
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
