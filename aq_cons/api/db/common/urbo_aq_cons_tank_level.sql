/*
 * Function to calculate AquaGIS tanks level.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_tank_level('scope', '2018-01-16T08:00:00.000Z');
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_tank_level(varchar, timestamp);

CREATE OR REPLACE FUNCTION urbo_aq_cons_tank_level(
    id_scope varchar,
    moment timestamp,
    isdebug boolean DEFAULT FALSE
  )
  RETURNS void AS
  $$
  DECLARE
    table_tank_measurand text;
    table_tank_lastdata text;

    table_sector_lastdata text;
    table_sector_agg text;

    table_plan_emergency text;
    table_plan_opt text;

    _q text;
    _q_0 text;
    _q_1 text;
    _q_2 text;
    _q_3 text;

  BEGIN
    table_tank_lastdata := urbo_get_table_name(id_scope, 'aq_cons_tank', FALSE, TRUE);
    table_tank_measurand := urbo_get_table_name(id_scope, 'aq_cons_tank_measurand');

    table_sector_lastdata := urbo_get_table_name(id_scope, 'aq_cons_sector', FALSE, TRUE);
    table_sector_agg := urbo_get_table_name(id_scope, 'aq_cons_sector_agg_hour');

    table_plan_emergency := urbo_get_table_name(id_scope, 'aq_plan_tank_pump_emergency');
    table_plan_opt := urbo_get_table_name(id_scope, 'aq_plan_tank_pump_opt');

    _q_0 = format('
      WITH consumption_by_tank AS (
        SELECT reftank, SUM(consumption) AS sum_consumption
          FROM %1$s sector_lastdata
          INNER JOIN (
            SELECT *
            FROM %2$s
            WHERE
              "TimeInstant" > %3$L::timestamp - interval ''1h''
              AND "TimeInstant" <= %3$L::timestamp) sector_agg
          ON sector_lastdata.id_entity = sector_agg.id_entity
          GROUP BY reftank
      ),', table_sector_lastdata, table_sector_agg, moment);


    _q_1 = format('
      start_pump_emergency AS (
        SELECT 
          id_entity, 
          "TimeInstant", 
          row_number() OVER () AS rnum
        FROM 
          %1$s
        WHERE 
          activated = ''t''
          AND "TimeInstant" >= %2$L::timestamp
          AND "TimeInstant" <= %2$L::timestamp + ''23:59:59.999''
        ORDER BY "TimeInstant"
      ),

      finish_pump_emergency AS (
        SELECT
          id_entity, 
          "TimeInstant",
          row_number() OVER () AS rnum
        FROM 
          %1$s
        WHERE
          activated = ''f''
          AND "TimeInstant" >= %2$L
          AND "TimeInstant" <= %2$L::timestamp + ''23:59:59.999''
        ORDER BY "TimeInstant"
      ),
      
      pump_time_emergency AS (
        SELECT 
          start_pump_emergency."TimeInstant" AS start,
          finish_pump_emergency."TimeInstant" AS finish,
          ABS(EXTRACT(MINUTES FROM finish_pump_emergency."TimeInstant" - start_pump_emergency."TimeInstant"))/60 AS hours_activated
          FROM 
            start_pump_emergency
          INNER JOIN 
            finish_pump_emergency
          ON
          start_pump_emergency.rnum = finish_pump_emergency.rnum
      ),

      pump_water_emergency AS (
        SELECT
          id_entity,
          start,
          finish,
          (hours_activated * pump_flow) AS litres_filled
        FROM
          pump_time_emergency,
          %3$s
      ),
      ', table_plan_emergency, moment, table_tank_lastdata);

      _q_2 = format('
        -- Optimized tables

        start_pump_opt AS
          (SELECT
            id_entity,
            "TimeInstant",
            row_number() OVER () AS rnum
          FROM
            %1$s
          WHERE
            activated = ''t''
            AND "TimeInstant" >= %2$L
            AND "TimeInstant" <= %2$L::timestamp + ''23:59:59.999'' ORDER BY "TimeInstant"
          ),

        finish_pump_opt AS 
          (SELECT
            id_entity,
            "TimeInstant",
            row_number() OVER () AS rnum
          FROM
            %1$s
          WHERE
            activated = ''f''
            AND "TimeInstant" >= %2$L
            AND "TimeInstant" <= %2$L::timestamp + ''23:59:59.999'' ORDER BY "TimeInstant"
          ),

        pump_time_opt AS 
          (SELECT
            start_pump_opt."TimeInstant" AS start,
            finish_pump_opt."TimeInstant" AS finish,
            ABS(EXTRACT(
              MINUTES FROM finish_pump_opt."TimeInstant" - start_pump_opt."TimeInstant"))/60 AS hours_activated
              FROM
                start_pump_opt
              INNER JOIN
                finish_pump_opt
              ON 
              start_pump_opt.rnum = finish_pump_opt.rnum
          ),
      
        pump_water_opt AS (
          SELECT
            id_entity,
            start,
            finish,
            (hours_activated * pump_flow) AS litres_filled
          FROM
            pump_time_opt,
            %3$s
        ),

      ', table_plan_opt, moment, table_tank_lastdata);

      _q_3 = format('

      tank_refill as (
        SELECT 
          b.id_entity,
          SUM(CASE WHEN c.litres_filled IS NULL THEN a.litres_filled ELSE c.litres_filled END) AS litres
        FROM pump_water_emergency a
        INNER JOIN %2$s b ON a.id_entity = b.id_entity
        LEFT JOIN pump_water_opt c ON b.id_entity=c.id_entity
        GROUP BY b.id_entity
      ),

      _ AS (UPDATE %1$s measurand
        SET level = measurand.level - COALESCE(consumption_by_tank.sum_consumption, 0) + COALESCE(tank_refill.litres, 0)
        FROM consumption_by_tank, tank_refill
        WHERE "TimeInstant" > %3$L::timestamp - interval ''1h''
          AND "TimeInstant" <= %3$L::timestamp
          AND measurand.id_entity = consumption_by_tank.reftank
          AND measurand.id_entity = tank_refill.id_entity)

      UPDATE %2$s lastdata
        SET level = lastdata.level - COALESCE(consumption_by_tank.sum_consumption, 0) + COALESCE(tank_refill.litres, 0)
        FROM consumption_by_tank, tank_refill
        WHERE "TimeInstant" > %3$L::timestamp - interval ''1h''
          AND "TimeInstant" <= %3$L::timestamp
          AND lastdata.id_entity = consumption_by_tank.reftank
          AND lastdata.id_entity = tank_refill.id_entity;
      ',
      table_tank_measurand, table_tank_lastdata, moment
    );

    _q := format('
      %s
      %s
      %s
      %s',
      _q_0, _q_1, _q_2, _q_3);

    IF isdebug IS TRUE THEN
      RAISE NOTICE '%', _q;
    END IF;

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
