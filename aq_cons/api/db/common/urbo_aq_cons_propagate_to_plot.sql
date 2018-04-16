/*
 * Function to propagate AquaGIS Flow, Pressure and Usage from constructions to plot.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_propagate_to_plot('scope', '2018-01-10T08:15:00.000Z', 5);
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_propagate_to_plot(varchar, timestamp, integer);

CREATE OR REPLACE FUNCTION urbo_aq_cons_propagate_to_plot(
    id_scope varchar,
    moment timestamp,
    minutes integer
  )
  RETURNS void AS
  $$
  DECLARE
    _t_plot_ld text;
    _t_plot_ms text;
    _t_const_ld text;
    _t_const_ms text;
    _q text;
  BEGIN

    _t_plot_ld := urbo_get_table_name(id_scope, 'aq_cons_plot', FALSE, TRUE);
    _t_plot_ms := urbo_get_table_name(id_scope, 'aq_cons_plot_measurand');
    _t_const_ld := urbo_get_table_name(id_scope, 'aq_cons_const', FALSE, TRUE);
    _t_const_ms := urbo_get_table_name(id_scope, 'aq_cons_const_measurand');

    _q := format('
      WITH urbo_aq_cons_const_measurand_per_plot_and_usage AS (
        SELECT sl.id_entity, ''%s''::timestamp AS "TimeInstant",
            SUM(COALESCE(cm.flow, 0)) AS flow,
            AVG(COALESCE(cm.pressure, 0)) AS pressure, cl.usage
          FROM (SELECT id_entity FROM %s) sl
            LEFT JOIN (SELECT id_entity, usage, refplot FROM %s) cl
              on sl.id_entity = cl.refplot
            LEFT JOIN (
              SELECT id_entity, MAX("TimeInstant") AS "TimeInstant",
                  AVG(flow) AS flow, AVG(pressure) AS pressure
                FROM %s
              WHERE "TimeInstant" <= ''%s''
                AND "TimeInstant" > ''%s''::timestamp - interval ''%s minutes''
              GROUP BY id_entity
            ) cm
              ON cl.id_entity = cm.id_entity
          GROUP BY sl.id_entity, cl.usage
      ),
      urbo_aq_cons_plot_measurand AS (
        SELECT q0.id_entity, q1."TimeInstant", q0.flow, q0.pressure,
            q1.usage
          FROM (
            SELECT id_entity, SUM(flow) AS flow, SUM(pressure) AS pressure
              FROM urbo_aq_cons_const_measurand_per_plot_and_usage q00
              GROUP BY id_entity
          ) q0
            INNER JOIN (
              SELECT DISTINCT ON (id_entity) id_entity, "TimeInstant", usage
                FROM urbo_aq_cons_const_measurand_per_plot_and_usage q10
                ORDER BY id_entity ASC, flow DESC
            ) q1
              ON q0.id_entity = q1.id_entity
      ),
      urbo_update_aq_cons_plot_lastdata AS (
        UPDATE %s sl
          SET "TimeInstant" = sm."TimeInstant",
            flow = sm.flow,
            pressure = sm.pressure,
            usage = sm.usage
          FROM urbo_aq_cons_plot_measurand sm
          WHERE sl.id_entity = sm.id_entity
      )
      INSERT INTO %s
          (id_entity, "TimeInstant", flow, pressure, usage)
        SELECT id_entity, "TimeInstant", flow, pressure, usage
          FROM urbo_aq_cons_plot_measurand
          ON CONFLICT (id_entity, "TimeInstant")
            DO UPDATE SET
              flow = EXCLUDED.flow,
              pressure = EXCLUDED.pressure,
              usage = EXCLUDED.usage;
      ',
      moment, _t_plot_ld, _t_const_ld, _t_const_ms, moment, moment, minutes,
      _t_plot_ld,
      _t_plot_ms
    );

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
