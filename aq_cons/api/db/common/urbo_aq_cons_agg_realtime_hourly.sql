/*
 * Function to calculate AquaGIS Consuption or Forecast in constructions or sectors.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_agg_realtime_hourly('aljarafe', '2018-01-16T08:00:00.000Z');
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_agg_realtime_hourly(varchar, timestamp);

CREATE OR REPLACE FUNCTION urbo_aq_cons_agg_realtime_hourly(
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
        (id_entity, "TimeInstant", consumption, pressure_agg)
      SELECT id_entity, ''%s'' AS "TimeInstant",
          AVG(flow) AS consumption, AVG(pressure) AS pressure_agg
        FROM %s
        WHERE "TimeInstant" >= ''%s''
          AND "TimeInstant" < ''%s''::timestamp + interval ''1 hour''
        GROUP BY id_entity
      ON CONFLICT (id_entity, "TimeInstant")
        DO UPDATE SET
          consumption = EXCLUDED.consumption,
          pressure_agg = EXCLUDED.pressure_agg;

      -- PLOT
      INSERT INTO %s
        (id_entity, "TimeInstant", consumption, pressure_agg)
      SELECT q1.refplot AS id_entity, ''%s'' AS "TimeInstant",
          SUM(q0.consumption) AS consumption, AVG(q0.pressure_agg) AS pressure_agg
        FROM (
          SELECT id_entity, "TimeInstant", consumption, pressure_agg
            FROM %s
            WHERE "TimeInstant" >= ''%s''
              AND "TimeInstant" < ''%s''::timestamp + interval ''1 hour''
        ) q0
          INNER JOIN (
            SELECT id_entity, refplot
              FROM %s
          ) q1
            ON q0.id_entity = q1.id_entity
        GROUP BY q1.refplot
      ON CONFLICT (id_entity, "TimeInstant")
        DO UPDATE SET
          consumption = EXCLUDED.consumption,
          pressure_agg = EXCLUDED.pressure_agg;

      -- SECTOR
      INSERT INTO %s
        (id_entity, "TimeInstant", consumption, pressure_agg)
      SELECT q1.refsector AS id_entity, ''%s'' AS "TimeInstant",
          SUM(q0.consumption) + (SUM(q0.consumption) / 100 * AVG(q2.performance)) AS consumption, AVG(q0.pressure_agg) AS pressure_agg
        FROM (
          SELECT id_entity, "TimeInstant", consumption, pressure_agg
            FROM %s
            WHERE "TimeInstant" >= ''%s''
              AND "TimeInstant" < ''%s''::timestamp + interval ''1 hour''
        ) q0
          INNER JOIN (
            SELECT id_entity, refsector
              FROM %s
          ) q1
            ON q0.id_entity = q1.id_entity
          INNER JOIN (
            SELECT id_entity, AVG(performance) AS performance
              FROM %s
              WHERE "TimeInstant" >= ''%s''
                AND "TimeInstant" < (''%s'')::timestamp + interval ''1 hour''
              GROUP BY id_entity
          ) q2
            ON q1.refsector = q2.id_entity
        GROUP BY q1.refsector
      ON CONFLICT (id_entity, "TimeInstant")
        DO UPDATE SET
          consumption = EXCLUDED.consumption,
          pressure_agg = EXCLUDED.pressure_agg;
      ',
      _t_const_ag, moment, _t_const_ms, moment, moment,

      _t_plot_ag, moment, _t_const_ag, moment, moment, _t_const_ld,

      _t_sector_ag, moment, _t_plot_ag, moment, moment, _t_plot_ld, _t_aux_lk,
      moment, moment
    );

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
