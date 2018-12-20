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

const PGSQLModel = require('../../models/pgsqlmodel.js');
const utils = require('../../utils.js');
var _ = require('underscore');
const request = require('request');

const log = utils.log();

class AqMaintenanceModel extends PGSQLModel {
  constructor(cfg) {
    super(cfg);
  }

  get this() {
    return this;  // Because parent is not a strict class
  }

  getIssuesList(opts) {


    var date_flt = '  ';
    var type_flt = '   ';
    var user_flt = '   ';
    var status_flt = '   ';
    var id_flt = '   ';


    if (opts.start && opts.finish)  {
      var date_flt = `AND created_at between '${opts.finish}' and '${opts.start}'`;
    }

    if (opts.type)  {
      var type_flt = `AND type = '${opts.type}'`;
    }

    if (opts.assigned_user)  {
      var user_flt = `AND id_user = '${opts.assigned_user}'`;
    }

    if (opts.status)  {
      var status_flt = `AND current_status = '${opts.status}'`;
    }

    if (opts.issue_number)  {
      var id_flt = `AND id = '${opts.issue_number}'`;
    }

    let sql = `

      WITH issues as (
        SELECT
          *,
          ST_AsGeoJSON(position) as position
        FROM
          ${opts.scope}.maintenance_issues
        WHERE true
          ${date_flt}
          ${type_flt}
          ${user_flt}
          ${status_flt}
          ${id_flt}
      )
      SELECT
        *,
        (SELECT array_to_json(array_agg(row_to_json(t))) FROM (
          select *
          from madrid.maintenance_status
          group by created_at, type, id, id_issue, id_user, id_entity, updated_at
          order by created_at desc
        ) t WHERE id_issue = issues.id::varchar) as status,
        (SELECT array_to_json(array_agg(row_to_json(t))) FROM (
          select *
          from madrid.maintenance_files
          group by created_at, id, id_issue, id_user, id_entity, updated_at order by created_at desc
        ) t WHERE id_issue = issues.id::varchar) as files
      FROM issues
      ORDER BY issues.created_at desc

      `;

    return this.promise_query(sql)
    .then(function(data) {

      log.info(typeof(data.rows[1]));

      let features = [];

      for (let key in data.rows) {
        let position = JSON.parse(data.rows[key]["position"]);
        delete data.rows[key]["position"];
        let feature = {
          "type": "Feature",
          "geometry": position,
          "properties": data.rows[key]
        }
        features.push(feature);
      }

      let geojson_wrapper = {
        "type": "FeatureCollection",
        "features": features
      };

      return Promise.resolve(geojson_wrapper);
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }


  createIssue(opts) {

    let sql = `
    INSERT INTO
      ${opts.scope}.maintenance_issues
      (
        id_entity,
        "TimeInstant",
        position,
        type,
        address,
        budget,
        description,
        id_user,
        current_status,
        estimated_time
      )
    VALUES
      (
        'issue:${opts.type}_' || EXTRACT(MINUTE FROM now())::bigint::text || (EXTRACT(SECOND FROM now()) * 1000)::bigint::text,
        timezone('utc'::text, now()),
        ST_GeomFromText('POINT( ${opts.position[0]} ${opts.position[1]} )', 4326),
        '${opts.type}',
        '${opts.address}',
        '${opts.budget}',
        '${opts.description}',
        '${opts.assigned_user}',
        'registered',
        '${opts.estimated_time}'
      )
    RETURNING id
    ;
    `;

    return this.promise_query(sql)
    .then(function(data) {

      return Promise.resolve(data.rows);
    })

    .catch(function(err) {

      return Promise.reject(err);
    });
  }


  updateIssue(opts) {

    let sql = `
      UPDATE
        ${opts.scope}.maintenance_issues
      SET
        (
          "TimeInstant",
          type,
          address,
          budget,
          description,
          id_user,
          estimated_time
        )
      =
        (
          timezone('utc'::text, now()),
          '${opts.type}',
          '${opts.address}',
          '${opts.budget}',
          '${opts.description}',
          '${opts.assigned_user}',
          '${opts.estimated_time}'
        )

      WHERE id = ${opts.id}
      ;
      `;

    log.info(sql);

    return this.promise_query(sql)
    .then(function(data) {

      return Promise.resolve({"message": "ok"});
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }


  deleteIssue(opts) {

    let sql = `
      DELETE FROM
        ${opts.scope}.maintenance_issues
      WHERE id = ${opts.id}
      RETURNING id
      ;
      `;

    return this.promise_query(sql)
    .then(function(data) {

      log.info("data from delete", data);
      return Promise.resolve(data.rows);
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }


  getStatusList(opts) {

    let sql = `
      SELECT
        *
      FROM
        ${opts.scope}.maintenance_status
      WHERE true
        AND id_issue = '${opts.id_issue}'

      `;

    return this.promise_query(sql)
    .then(function(data) {

      return Promise.resolve(data.rows);
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }


  createStatus(opts) {

    let sql = `
      INSERT INTO
        ${opts.scope}.maintenance_status
        (
          id_entity,
          type,
          id_issue,
          id_user
        )
      VALUES
        (
          'status:${opts.type}_${opts.id_issue}_${opts.id_user}' || EXTRACT(MINUTE FROM now())::bigint::text || (EXTRACT(SECOND FROM now()) * 1000)::bigint::text,
          '${opts.type}',
          '${opts.id_issue}',
          '${opts.id_user}'
        )
      ;
      `;

    return this.promise_query(sql)
    .then(function(data) {

      return Promise.resolve({"message": "ok"});
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }


  deleteStatus(opts) {

    let sql = `
      DELETE FROM
        ${opts.scope}.maintenance_status
      WHERE id_issue = ${opts.id_issue}::text
    ;
    `;

    return this.promise_query(sql)
    .then(function(data) {

      return Promise.resolve({"message": "ok"});
    })

    .catch(function(err) {
      return Promise.reject(err);
    });

  }


  getFilesList(opts) {

    let sql = `
      SELECT
        *
      FROM
        ${opts.scope}.maintenance_files
      WHERE true
        AND id_issue = '${opts.id_issue}'

      `;

    return this.promise_query(sql)
    .then(function(data) {

      return Promise.resolve(data.rows);
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }


  createFile(opts) {

    let sql = `
      INSERT INTO
        ${opts.scope}.maintenance_files
        (
          id_entity,
          name,
          id_issue,
          id_user
        )
      VALUES
        (
          'file:${opts.id_issue}_${opts.id_user}',
          '${opts.name}'
          '${opts.id_issue}',
          '${opts.id_user}'
        )
      ;
      `;

    return this.promise_query(sql)
    .then(function(data) {

      return Promise.resolve({"message": "ok"});
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }


  deleteFile(opts) {

    let sql = `
      DELETE FROM
        ${opts.scope}.maintenance_files
        where id = ${opts.id}
      ;
      `;

    return this.promise_query(sql)
    .then(function(data) {

      return Promise.resolve({"message": "ok"});
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }


  getAddress(position) {

    var options = {
      url: `https://nominatim.openstreetmap.org/search?q=${position[0]},${position[1]}&format=json`,
      headers: {
          'User-Agent': 'request'
      }
    };
    let address = new Promise(function(resolve, reject) {
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(body));
            }
        })
    })

    return address
    .then(function(data) {

      return Promise.resolve(data);
    })
    .catch(function(err) {

      return Promise.reject(err);
    });


  }


  getStatusTypes() {
    let sql = `
      SELECT unnest(enum_range(NULL::status_type))
      ;
      `;

    return this.promise_query(sql)
    .then(function(data) {

      return Promise.resolve(data.rows);
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }


  getIssuesTypes() {
    let sql = `
      SELECT unnest(enum_range(NULL::order_type))
      ;
      `;

    return this.promise_query(sql)
    .then(function(data) {

      return Promise.resolve(data.rows);
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }


}

module.exports = AqMaintenanceModel;
