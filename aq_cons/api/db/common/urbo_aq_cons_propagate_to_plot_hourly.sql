/*
 * Function to propagate AquaGIS Consumption from constructions to plots.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_propagate_to_plot_hourly('scope', '2018-01-10T08:00:00.000Z');
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_propagate_to_plot_hourly(varchar, timestamp);

CREATE OR REPLACE FUNCTION urbo_aq_cons_propagate_to_plot_hourly(
    id_scope varchar,
    moment timestamp
  )
  RETURNS void AS
  $$
  DECLARE
    _t_const_ld text;
    _t_const_ah text;
    _t_plot_ld text;
    _t_plot_ms text;
    _q text;
  BEGIN

    _t_const_ld := urbo_get_table_name(id_scope, 'aq_cons_const', FALSE, TRUE);
    _t_const_ah := urbo_get_table_name(id_scope, 'aq_cons_const_agg_hour');
    _t_plot_ld := urbo_get_table_name(id_scope, 'aq_cons_plot', FALSE, TRUE);
    _t_plot_ms := urbo_get_table_name(id_scope, 'aq_cons_plot_measurand');

    _q := format('
      WITH urbo_aq_cons_plot_measurand AS (
        SELECT cl.refplot AS id_entity, SUM(consumption) AS consumption
          FROM %s ca
            INNER JOIN %s cl
              ON ca.id_entity = cl.id_entity
          WHERE ca."TimeInstant" >= ''%s''
            AND ca."TimeInstant" < ''%s''::timestamp + interval ''1 hour''
          GROUP BY cl.refplot
      ),
      urbo_update_aq_cons_plot_lastdata AS (
        UPDATE %s pl
          SET consumption = pm.consumption
          FROM urbo_aq_cons_plot_measurand pm
          WHERE pl.id_entity = pm.id_entity
      )
      INSERT INTO %s
          (id_entity, "TimeInstant", consumption)
        SELECT id_entity, ''%s'', consumption
          FROM urbo_aq_cons_plot_measurand;
      ',
      _t_const_ah, _t_const_ld, moment, moment,
      _t_plot_ld,
      _t_plot_ms, moment
    );

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
