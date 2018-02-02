/*
 * Function to know if there are leakges in AquaGIS.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT * FROM urbo_aq_cons_are_leakages_per_sector('scope', '2018-01-10T08:15:00.000Z');
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_are_leakages_per_sector(varchar, timestamp);

CREATE OR REPLACE FUNCTION urbo_aq_cons_are_leakages_per_sector(
    id_scope varchar,
    moment timestamp
  )
  RETURNS TABLE(
    id_entity varchar,
    flow_perc double precision,
    pressure_perc double precision,
    performance double precision
  ) AS
  $$
  DECLARE
    _t_leak text;
    _t_sector_ld text;
    _q text;
  BEGIN

    _t_leak := urbo_get_table_name(id_scope, 'aq_aux_leak');
    _t_sector_ld := urbo_get_table_name(id_scope, 'aq_cons_sector', FALSE, TRUE);

    _q := format('
      SELECT acs.id_entity::varchar, COALESCE(aal.flow_perc, 0) AS flow_perc,
          COALESCE(aal.pressure_perc, 0) AS pressure_perc,
          COALESCE(aal.performance, 0) AS performance
        FROM (
          SELECT DISTINCT ON (id_entity) id_entity, flow_perc,
              CASE WHEN pressure_perc > 0 THEN (pressure_perc * (-1))
                ELSE 0 END AS pressure_perc,
              performance
            FROM %s
            WHERE "TimeInstant" <= ''%s''
            ORDER BY id_entity ASC, "TimeInstant" DESC
        ) aal
          RIGHT JOIN %s acs
            ON aal.id_entity = acs.id_entity;
      ',
      _t_leak, moment, _t_sector_ld
    );

    RETURN QUERY EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
