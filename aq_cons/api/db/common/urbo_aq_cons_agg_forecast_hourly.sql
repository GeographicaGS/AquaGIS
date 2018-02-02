/*
 * Function to calculate AquaGIS Consuption or Forecast in constructions or sectors.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_agg_forecast_hourly('aljarafe', '2018-01-16T08:00:00.000Z');
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_agg_forecast_hourly(varchar, timestamp);

CREATE OR REPLACE FUNCTION urbo_aq_cons_agg_forecast_hourly(
    id_scope varchar,
    moment timestamp
  )
  RETURNS void AS
  $$
  DECLARE
    _t_const_ld text;
    _t_const_ms text;
    _t_const_ag text;
    _t_plot_ld text;
    _t_plot_ag text;
    _t_sector_ag text;
    _t_aux_ft text;
    _t_aux_lk text;
    _q text;
  BEGIN

    _t_const_ld  := urbo_get_table_name(id_scope, 'aq_cons_const', FALSE, TRUE);
    _t_const_ms := urbo_get_table_name(id_scope, 'aq_cons_const_measurand');
    _t_const_ag := urbo_get_table_name(id_scope, 'aq_cons_const_agg_hour');

    _t_plot_ld  := urbo_get_table_name(id_scope, 'aq_cons_plot', FALSE, TRUE);
    _t_plot_ag := urbo_get_table_name(id_scope, 'aq_cons_plot_agg_hour');

    _t_sector_ag := urbo_get_table_name(id_scope, 'aq_cons_sector_agg_hour');

    _t_aux_ft := urbo_get_table_name(id_scope, 'aq_aux_const_futu');
    _t_aux_lk := urbo_get_table_name(id_scope, 'aq_aux_leak');

    _q := format('
      -- CONSTRUCTION
      INSERT INTO %s
        (id_entity, "TimeInstant", forecast, pressure_forecast)
      SELECT id_entity, ''%s''::timestamp + interval ''14 days'' AS "TimeInstant",
          AVG(flow) AS forecast, AVG(pressure) AS pressure_forecast
        FROM %s
        WHERE "TimeInstant" >= ''%s''::timestamp + interval ''14 days''
          AND "TimeInstant" < ''%s''::timestamp + interval ''14 days'' + interval ''1 hour''
        GROUP BY id_entity
      ON CONFLICT (id_entity, "TimeInstant")
        DO UPDATE SET
          forecast = EXCLUDED.forecast,
          pressure_forecast = EXCLUDED.pressure_forecast;

      -- PLOT
      INSERT INTO %s
        (id_entity, "TimeInstant", forecast, pressure_forecast)
      SELECT q1.refplot AS id_entity, ''%s''::timestamp + interval ''14 days'' AS "TimeInstant",
          SUM(q0.forecast) AS forecast, AVG(q0.pressure_forecast) AS pressure_forecast
        FROM (
          SELECT id_entity, "TimeInstant", forecast, pressure_forecast
            FROM %s
            WHERE "TimeInstant" >= ''%s''::timestamp + interval ''14 days''
              AND "TimeInstant" < ''%s''::timestamp + interval ''14 days'' + interval ''1 hour''
        ) q0
          INNER JOIN (
            SELECT id_entity, refplot
              FROM %s
          ) q1
            ON q0.id_entity = q1.id_entity
        GROUP BY q1.refplot
      ON CONFLICT (id_entity, "TimeInstant")
        DO UPDATE SET
          forecast = EXCLUDED.forecast,
          pressure_forecast = EXCLUDED.pressure_forecast;

      -- SECTOR
      INSERT INTO %s
        (id_entity, "TimeInstant", forecast, pressure_forecast)
      SELECT q1.refsector AS id_entity, ''%s''::timestamp + interval ''14 days'' AS "TimeInstant",
          SUM(q0.forecast) AS forecast, AVG(q0.pressure_forecast) AS pressure_forecast
        FROM (
          SELECT id_entity, "TimeInstant", forecast, pressure_forecast
            FROM %s
            WHERE "TimeInstant" >= ''%s''::timestamp + interval ''14 days''
              AND "TimeInstant" < ''%s''::timestamp + interval ''14 days'' + interval ''1 hour''
        ) q0
          INNER JOIN (
            SELECT id_entity, refsector
              FROM %s
          ) q1
            ON q0.id_entity = q1.id_entity
        GROUP BY q1.refsector
      ON CONFLICT (id_entity, "TimeInstant")
        DO UPDATE SET
          forecast = EXCLUDED.forecast,
          pressure_forecast = EXCLUDED.pressure_forecast;
      ',
      _t_const_ag, moment, _t_aux_ft, moment, moment,

      _t_plot_ag, moment, _t_const_ag, moment, moment, _t_const_ld,

      _t_sector_ag, moment, _t_plot_ag, moment, moment, _t_plot_ld
    );

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
