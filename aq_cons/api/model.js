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

const log = utils.log();

class AqConsModel extends PGSQLModel {
  constructor(cfg) {
    super(cfg);
  }

  get this() {
    return this;  // Because parent is not a strict class
  }

  getPlotConstructions(opts) {
    let sql = `
      SELECT 
        *
      FROM 
        ${opts.scope}.aq_cons_const_lastdata
      WHERE 
        refplot = '${opts.id_plot}'
      `;

    return this.promise_query(sql)
    .then(function(data) {
      data = data.rows.map((x) => {
        delete x.position;
        delete x.id;

        return x;
      });

      if (!data.length) {
        return Promise.reject(utils.error('Plot not found', 404));
      }

      return Promise.resolve(data);
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }

  getTankActivationHours(opts) {
    let sql = `
      WITH

      start_pump_opt AS
        (SELECT 
          id_entity,
          "TimeInstant",
          row_number() OVER () AS rnum
        FROM 
          ${opts.scope}.aq_plan_tank_pump_opt
        WHERE 
          activated = 't'
          AND id_entity='${opts.id_entity}'
          AND "TimeInstant" >= '${opts.time}'::TIMESTAMP
          AND "TimeInstant" <= '${opts.time}'::TIMESTAMP + '23:59:59.999'
        ORDER BY "TimeInstant"
        ),

      finish_pump_opt AS
        (SELECT 
          id_entity,
          "TimeInstant",
          row_number() OVER () AS rnum
        FROM 
          ${opts.scope}.aq_plan_tank_pump_opt
        WHERE
          activated = 'f'
          AND id_entity='${opts.id_entity}
          AND "TimeInstant" >= '${opts.time}::TIMESTAMP
          AND "TimeInstant" <= '${opts.time}::TIMESTAMP + '23:59:59.999'
        ORDER BY "TimeInstant"
        ),

      pump_time_opt AS
        (SELECT 
          start_pump_opt."TimeInstant" AS START,
          finish_pump_opt."TimeInstant" AS FINISH,
          'false'::boolean AS emergency
        FROM
          start_pump_opt
        INNER JOIN
          finish_pump_opt
        ON start_pump_opt.rnum = finish_pump_opt.rnum
        ),

      start_pump_emergency AS
        (SELECT 
          id_entity,
          "TimeInstant",
          row_number() OVER () AS rnum
        FROM
          ${opts.scope}.aq_plan_tank_pump_emergency
        WHERE
          activated = 't'
          AND id_entity='${opts.id_entity}
          AND "TimeInstant" >= '${opts.time}::TIMESTAMP
          AND "TimeInstant" <= '${opts.time}::TIMESTAMP + '23:59:59.999'
        ORDER BY "TimeInstant"),

      finish_pump_emergency AS
        (SELECT
          id_entity,
          "TimeInstant",
          row_number() OVER () AS rnum
        FROM ${opts.scope}.aq_plan_tank_pump_emergency
        WHERE
          activated = 'f'
          AND id_entity='${opts.id_entity}
          AND "TimeInstant" >= '${opts.time}::TIMESTAMP
          AND "TimeInstant" <= '${opts.time}::TIMESTAMP + '23:59:59.999'
        ORDER BY "TimeInstant"),

      pump_time_opt_emergency AS
        (SELECT 
          START,
          FINISH,
          emergency
        FROM
          pump_time_opt
        WHERE
          COALESCE(
            pump_time_opt.START < (
              SELECT
                min("TimeInstant")
              FROM
                start_pump_emergency),
              TRUE
            )
          UNION ALL 
            SELECT
              start_pump_emergency."TimeInstant" AS START,
              finish_pump_emergency."TimeInstant" AS FINISH,
              'true'::boolean AS emergency
            FROM
              start_pump_emergency
            INNER JOIN
              finish_pump_emergency
            ON start_pump_emergency.rnum = finish_pump_emergency.rnum
        )

        SELECT * FROM pump_time_opt_emergency;
    `;

    return this.promise_query(sql)
    .then(function(data) {

      return Promise.resolve(data.rows);
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }

  // TODO: https://github.com/GeographicaGS/AquaGIS/issues/125#issuecomment-370883175
  getPlansStatistics(opts, emergency) {

    var selector = `
        SELECT 
          energy_consumption_opt_sum.kWh_used,
          average_price_water_opt.price_by_litre,
          price_cost_no_opt_sum.money_spent - price_cost_opt_sum.money_spent AS money_saved,
          (1 - (energy_consumption_opt_sum.kWh_used/energy_consumption_no_opt_sum.kWh_used))*100 AS energy_saved_ratio
        `;

    if (emergency == true) {
      selector = selector + `, 
      energy_consumption_emergency_sum.kWh_used AS kWh_used_emergency,
      average_price_water_emergency.price_by_litre AS price_by_litre_emergency,
      price_cost_no_opt_sum.money_spent - price_cost_emergency_sum.money_spent AS money_saved_emergency,
      (1 - (energy_consumption_emergency_sum.kWh_used/energy_consumption_no_opt_sum.kWh_used))*100 AS energy_saved_ratio_emergency
      `;
    }


    let sql = `
    WITH 

    tank_properties AS 
      (SELECT 
        *
      FROM
        ${opts.scope}.aq_cons_tank
      WHERE
        id_entity='${opts.id_entity}
      ),

    -- Optimized tables

    start_pump_opt AS
      (SELECT
        id_entity,
        "TimeInstant",
        row_number() OVER () AS rnum
      FROM
        ${opts.scope}.aq_plan_tank_pump_opt
      WHERE
        activated = 't'
        AND id_entity='${opts.id_entity}' AND "TimeInstant" >= '${opts.time}'
        AND "TimeInstant" <= '${opts.time}'::timestamp + '23:59:59.999' ORDER BY "TimeInstant"
      ),

    finish_pump_opt AS 
      (SELECT
        id_entity,
        "TimeInstant",
        row_number() OVER () AS rnum
      FROM
        ${opts.scope}.aq_plan_tank_pump_opt
      WHERE
        activated = 'f'
        AND id_entity='${opts.id_entity} AND "TimeInstant" >= '${opts.time}
        AND "TimeInstant" <= '${opts.time}::timestamp + '23:59:59.999' ORDER BY "TimeInstant"
      ),

    pump_time_opt AS 
      (SELECT
        start_pump_opt."TimeInstant" AS start,
        finish_pump_opt."TimeInstant" AS finish,
        EXTRACT(
          MINUTES FROM finish_pump_opt."TimeInstant" - start_pump_opt."TimeInstant")/60 AS hours_activated
          FROM
            start_pump_opt
          INNER JOIN
            finish_pump_opt
          ON 
          start_pump_opt.rnum = finish_pump_opt.rnum
      ),
    
    pump_water_opt AS (
      SELECT
        start,
        finish,
        (hours_activated * pump_flow) AS litres_filled
      FROM
        pump_time_opt,
        tank_properties
    ),
          
    energy_consumption_opt AS (
      SELECT
        start,
        finish,
        (hours_activated * pump_power)*1000 AS kWh_used
      FROM
        pump_time_opt,
        tank_propertie s
    ),

    price_cost_opt AS (
      SELECT
        start,
        finish,
        (kWh_used * price) AS money_spent
      FROM 
        energy_consumption_opt
      INNER JOIN 
        ${opts.scope}.aq_aux_energy_prices
      ON 
        energy_consumption_opt.start >= aq_aux_energy_prices."TimeInstant"
        AND energy_consumption_opt.finish <= aq_aux_energy_prices."TimeInstant"+'1h'::interval
    ),

    -- Not optimized tables

    start_pump_no_opt AS (
      SELECT
        id_entity,
        "TimeInstant",
        row_number() OVER () AS rnum
      FROM
        ${opts.scope}.aq_plan_tank_pump_no_opt
      WHERE
        activated = 't'
        AND id_entity='${opts.id_entity}
        AND "TimeInstant" >= '${opts.time}
        AND "TimeInstant" <= '${opts.time}::timestamp + '23:59:59.999'
      ORDER BY "TimeInstant"
    ),

    finish_pump_no_opt AS (
      SELECT
        id_entity,
        "TimeInstant",
        row_number() OVER () AS rnum
      FROM
        ${opts.scope}.aq_plan_tank_pump_no_opt
      WHERE
        activated = 'f'
        AND id_entity='${opts.id_entity}
        AND "TimeInstant" >= '${opts.time}
        AND "TimeInstant" <= '${opts.time}::timestamp + '23:59:59.999'
        ORDER BY "TimeInstant"
    ),
    
    pump_time_no_opt AS (
      SELECT
        start_pump_no_opt."TimeInstant" AS start,
        finish_pump_no_opt."TimeInstant" AS finish,
        EXTRACT(
          MINUTES FROM finish_pump_no_opt."TimeInstant" - start_pump_no_opt."TimeInstant")/60 AS hours_activated
      FROM
        start_pump_no_opt
      INNER JOIN
        finish_pump_no_opt
      ON
        start_pump_no_opt.rnum = finish_pump_no_opt.rnum
    ),
    
    pump_water_no_opt AS (
      SELECT
        start,
        finish,
        (hours_activated * pump_flow) AS litres_filled
      FROM
        pump_time_no_opt,
        tank_properties
    ),
    
    energy_consumption_no_opt AS (
      SELECT
        start,
        finish,
        (hours_activated * pump_power)*1000 AS kWh_used
      FROM
        pump_time_no_opt,
        tank_properties
    ),
    
    price_cost_no_opt AS (
      SELECT
        start,
        finish,
        (kWh_used * price) AS money_spent
      FROM 
        energy_consumption_no_opt 
      INNER JOIN
        ${opts.scope}.aq_aux_energy_prices
      ON
        energy_consumption_no_opt.start >= aq_aux_energy_prices."TimeInstant"
        AND energy_consumption_no_opt.finish <= aq_aux_energy_prices."TimeInstant"+'1h'::interval
    ),

    -- Emergency tables

    start_pump_emergency AS (
      SELECT 
        id_entity, 
        "TimeInstant", 
        row_number() OVER () AS rnum
      FROM 
        ${opts.scope}.aq_plan_tank_pump_emergency 
      WHERE 
        activated = 't'
        AND id_entity='${opts.id_entity}
        AND "TimeInstant" >= '${opts.time}
        AND "TimeInstant" <= '${opts.time}::timestamp + '23:59:59.999'
      ORDER BY "TimeInstant"
    ),

    finish_pump_emergency AS (
      SELECT
        id_entity, 
        "TimeInstant",
        row_number() OVER () AS rnum
      FROM 
        ${opts.scope}.aq_plan_tank_pump_emergency 
      WHERE
        activated = 'f'
        AND id_entity='${opts.id_entity} 
        AND "TimeInstant" >= '${opts.time}
        AND "TimeInstant" <= '${opts.time}::timestamp + '23:59:59.999'
      ORDER BY "TimeInstant"
    ),
    
    pump_time_emergency AS (
      SELECT 
        start,
        finish,
        hours_activated
      FROM
        pump_time_opt
      WHERE
        pump_time_opt.start < (
          SELECT
            min("TimeInstant")
          FROM
            start_pump_emergency
          )
          UNION ALL
            SELECT 
              start_pump_emergency."TimeInstant" AS start,
              finish_pump_emergency."TimeInstant" AS finish,
              EXTRACT(
                MINUTES FROM finish_pump_emergency."TimeInstant" - start_pump_emergency."TimeInstant")/60 AS hours_activated
              FROM 
                start_pump_emergency
              INNER JOIN 
                finish_pump_emergency
              ON
              start_pump_emergency.rnum = finish_pump_emergency.rnum
    ),

    pump_water_emergency AS (
      SELECT
        start,
        finish,
        (hours_activated * pump_flow) AS litres_filled
      FROM
        pump_time_emergency,
        tank_properties
    ),

    energy_consumption_emergency AS (
      SELECT
        start,
        finish, 
        (hours_activated * pump_power)*1000 AS kWh_used
      FROM
        pump_time_emergency,
        tank_properties
    ),

    price_cost_emergency AS (
      SELECT
        start,
        finish,
        (kWh_used * price) AS money_spent
      FROM
        energy_consumption_emergency
      INNER JOIN 
        ${opts.scope}.aq_aux_energy_prices
      ON
        energy_consumption_emergency.start >= aq_aux_energy_prices."TimeInstant"
        AND energy_consumption_emergency.finish <= aq_aux_energy_prices."TimeInstant"+'1h'::interval
    ),

    -- Optimized calculations

    energy_consumption_opt_sum AS (
      SELECT
        sum(kWh_used) AS kWh_used
      FROM
        energy_consumption_opt
    ),

    price_cost_opt_sum AS (
      SELECT
        sum(money_spent) AS money_spent 
      FROM
        price_cost_opt
    ),

    average_price_water_opt AS (
      SELECT 
        SUM(price_cost_opt.money_spent/pump_water_opt.litres_filled) AS price_by_litre
      FROM
        price_cost_opt
      INNER JOIN
        pump_water_opt
      ON
        price_cost_opt.start = pump_water_opt.start
        AND price_cost_opt.finish = pump_water_opt.finish
    ),

    -- Not optimized calculations

    energy_consumption_no_opt_sum AS (
      SELECT 
        SUM(kWh_used) AS kWh_used 
      FROM 
        energy_consumption_no_opt
    ),

    price_cost_no_opt_sum AS (
      SELECT 
        SUM(money_spent) AS money_spent
      FROM 
        price_cost_no_opt
    ),

    -- Emergency calculations

    energy_consumption_emergency_sum AS (
      SELECT 
        SUM(kWh_used) AS kWh_used 
      FROM 
        energy_consumption_emergency
    ),

    price_cost_emergency_sum AS (
      SELECT 
        SUM(money_spent) AS money_spent
      FROM 
        price_cost_emergency
    ),

    average_price_water_emergency AS (
      SELECT
        SUM(price_cost_emergency.money_spent/pump_water_emergency.litres_filled) AS price_by_litre
      FROM 
        price_cost_emergency
      INNER JOIN
        pump_water_emergency
      ON 
        price_cost_emergency.start = pump_water_emergency.start
        AND price_cost_emergency.finish = pump_water_emergency.finish
    )

    ${selector}

    FROM 
      energy_consumption_opt_sum,
      energy_consumption_no_opt_sum,
      average_price_water_opt,
      price_cost_no_opt_sum,
      price_cost_opt_sum,
      energy_consumption_emergency_sum,
      average_price_water_emergency,
      price_cost_emergency_sum;

    `;


    return this.promise_query(sql)
    .then(function(data) {
      var first_data = _.first(data.rows)

      var saving = {};
      var emergency = {};

      for (var property in first_data) {
        if (property.endsWith('_emergency')) {
          emergency[property.replace('_emergency', '')] = first_data[property]
        } else {
          saving[property] = first_data[property]
        }
      }

      var result = {};

      if (!_.isEmpty(saving)) {
        result['saving'] = saving;
      }

      if (!_.isEmpty(emergency)) {
        result['emergency'] = emergency;
      }

      return Promise.resolve(result);
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }

}

module.exports = AqConsModel;
