/*
 * Function to propagate AquaGIS Flow, Pressure and Usage from constructions to sectors.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_propagate_to_sector('scope', '2018-01-10T08:15:00.000Z', 5);
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_propagate_to_sector(varchar, timestamp, integer);

CREATE OR REPLACE FUNCTION urbo_aq_cons_propagate_to_sector(
    id_scope varchar,
    moment timestamp,
    minutes integer
  )
  RETURNS void AS
  $$
  DECLARE
    _t_sector_ld text;
    _t_sector_ms text;
    _t_plot_ld text;
    _t_plot_ms text;
    _q text;
  BEGIN

    _t_sector_ld := urbo_get_table_name(id_scope, 'aq_cons_sector', FALSE, TRUE);
    _t_sector_ms := urbo_get_table_name(id_scope, 'aq_cons_sector_measurand');
    _t_plot_ld := urbo_get_table_name(id_scope, 'aq_cons_plot', FALSE, TRUE);
    _t_plot_ms := urbo_get_table_name(id_scope, 'aq_cons_plot_measurand');

    _q := format('
      WITH urbo_aq_cons_plot_measurand_per_sector_and_usage AS (
        SELECT sl.id_entity, ''%s''::timestamp AS "TimeInstant",
            AVG(COALESCE(cm.flow, 0)) AS flow,
            AVG(COALESCE(cm.pressure, 0)) AS pressure, cl.usage
          FROM (SELECT id_entity FROM %s) sl
            LEFT JOIN (SELECT id_entity, usage, refsector FROM %s) cl
              on sl.id_entity = cl.refsector
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
      urbo_aq_cons_sector_measurand AS (
        SELECT q2.id_entity, q2."TimeInstant",
            q2.flow + (q2.flow / 100 * al.flow_perc) + (q2.flow / 100 * al.performance) AS flow,
            q2.pressure + (q2.pressure / 100 * al.pressure_perc) AS pressure,
            q2.usage
          FROM (
            SELECT q01.id_entity, q11."TimeInstant", q01.flow, q01.pressure,
                q11.usage
              FROM (
                SELECT id_entity, SUM(flow) AS flow, SUM(pressure) AS pressure
                  FROM urbo_aq_cons_plot_measurand_per_sector_and_usage q00
                  GROUP BY id_entity
              ) q01
                INNER JOIN (
                  SELECT DISTINCT ON (id_entity) id_entity, "TimeInstant", usage
                    FROM urbo_aq_cons_plot_measurand_per_sector_and_usage q10
                    ORDER BY id_entity ASC, flow DESC
                ) q11
                  ON q01.id_entity = q11.id_entity
          ) q2
            LEFT JOIN (
                SELECT * FROM urbo_aq_cons_are_leakages_per_sector(
                  ''%s'', ''%s''
                )
              ) al
              ON q2.id_entity = al.id_entity
      ),
      urbo_update_aq_cons_sector_lastdata AS (
        UPDATE %s sl
          SET "TimeInstant" = sm."TimeInstant",
            flow = sm.flow,
            pressure = sm.pressure,
            usage = sm.usage
          FROM urbo_aq_cons_sector_measurand sm
          WHERE sl.id_entity = sm.id_entity
      )
      INSERT INTO %s
          (id_entity, "TimeInstant", flow, pressure, usage)
        SELECT id_entity, "TimeInstant", flow, pressure, usage
          FROM urbo_aq_cons_sector_measurand
        ON CONFLICT (id_entity, "TimeInstant")
          DO UPDATE SET
            flow = EXCLUDED.flow,
            pressure = EXCLUDED.pressure,
            usage = EXCLUDED.usage;
      ',
      moment, _t_sector_ld, _t_plot_ld, _t_plot_ms, moment, moment, minutes,
      id_scope, moment,
      _t_sector_ld,
      _t_sector_ms
    );

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
