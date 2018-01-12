/*
 * Function to know if there are leakges in AquaGIS.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_are_leakages('scope', '2018-01-10T08:15:00.000Z');
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_are_leakages(varchar, timestamp);

CREATE OR REPLACE FUNCTION urbo_aq_cons_are_leakages(
    id_scope varchar,
    moment timestamp
  )
  RETURNS TABLE(
    sector varchar,
    flow_perc double precision,
    pressure_perc double precision
  ) AS
  $$
  DECLARE
    _t_leak text;
    _t_sector text;
    _q text;
  BEGIN

    _t_leak := urbo_get_table_name(id_scope, 'aq_aux_leak');
    _t_sector := urbo_get_table_name(id_scope, 'aq_cons_sector');

    _q := format('
      SELECT acs.id_entity::varchar AS sector_id,
          COALESCE(aal.flow_perc, 0) AS flow_perc,
          COALESCE(aal.pressure_perc, 0) AS pressure_perc
        FROM (
          SELECT DISTINCT ON (id_entity) id_entity, flow_perc,
              CASE
                WHEN flow_perc < 30 THEN 0
                ELSE - (flow_perc + pressure_perc + pressure_variability - 1)
                  -- `-1` because the simulator can''t simulate `random(-1,1)`, so we are using `random(0,2)` instead
                END AS pressure_perc
            FROM %s
            WHERE is_leakage = TRUE
              AND "TimeInstant" + (interval ''1 hour'' * hours) > ''%s''
              AND "TimeInstant" <= ''%s''
            ORDER BY id_entity ASC, "TimeInstant" DESC
        ) aal
          RIGHT JOIN %s acs
            ON aal.id_entity = acs.id_entity;
      ',
      _t_leak, moment, moment, _t_sector
    );

    RETURN QUERY EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
