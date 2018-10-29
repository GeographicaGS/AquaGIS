/*
 * Function to calculate AquaGIS Consuption or Forecast in constructions or sectors.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_agg_forecast_hourly('scope', '2018-01-16T08:00:00.000Z');
-- SELECT urbo_aq_cons_agg_forecast_hourly('scope', '2018-01-16T08:00:00.000Z', FALSE);
-- SELECT urbo_aq_cons_agg_forecast_hourly('scope', '2018-01-16T08:00:00.000Z', TRUE);
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_agg_forecast_hourly(varchar, timestamp, boolean);

CREATE OR REPLACE FUNCTION urbo_aq_cons_agg_forecast_hourly(
    id_scope varchar,
    moment timestamp,
    on_conflict boolean DEFAULT FALSE  -- IF FALSE THEN REGULAR INSERT
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
    _on_conflict text;
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

    IF on_conflict IS TRUE THEN
      _on_conflict := 'ON CONFLICT (id_entity, "TimeInstant")
          DO UPDATE SET
            forecast = EXCLUDED.forecast,
            pressure_forecast = EXCLUDED.pressure_forecast';

    ELSE
      _on_conflict := '';
    END IF;

    -- CONSTRUCTION (previously inside format string)
    -- INSERT INTO %s
    --   (id_entity, "TimeInstant", forecast, pressure_forecast)
    -- SELECT id_entity, ''%s''::timestamp + interval ''14 days'' AS "TimeInstant",
    --     AVG(flow) AS forecast, AVG(pressure) AS pressure_forecast
    --   FROM %s
    --   WHERE "TimeInstant" >= ''%s''::timestamp + interval ''14 days''
    --     AND "TimeInstant" < ''%s''::timestamp + interval ''14 days'' + interval ''1 hour''
    --   GROUP BY id_entity
    -- %s;

    _q := format('
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
      %s;

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
      %s;
      ',
    --  _t_const_ag, moment, _t_aux_ft, moment, moment, _on_conflict,

      _t_plot_ag, moment, _t_const_ag, moment, moment, _t_const_ld, _on_conflict,

      _t_sector_ag, moment, _t_plot_ag, moment, moment, _t_plot_ld, _on_conflict
    );

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
