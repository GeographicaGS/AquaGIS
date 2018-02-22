/*
 * Function to calculate AquaGIS tanks level.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_tank_level('scope', '2018-01-16T08:00:00.000Z');
-- SELECT urbo_aq_cons_tank_level('scope', '2018-01-16T08:00:00.000Z', FALSE);
-- SELECT urbo_aq_cons_tank_level('scope', '2018-01-16T08:00:00.000Z', TRUE);
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_tank_level(varchar, timestamp);

CREATE OR REPLACE FUNCTION urbo_aq_cons_tank_level(
    id_scope varchar,
    moment timestamp
  )
  RETURNS void AS
  $$
  DECLARE
    table_tank_measurand text;
    table_tank text;
    table_sector_lastdata text;
    table_sector_agg text;

    _q text;

  BEGIN
    table_tank := urbo_get_table_name(id_scope, 'aq_cons_tank');
    table_tank_measurand := urbo_get_table_name(id_scope, 'aq_cons_tank_measurand');

    table_sector_lastdata := urbo_get_table_name(id_scope, 'aq_cons_sector', FALSE, TRUE);
    table_sector_agg := urbo_get_table_name(id_scope, 'aq_cons_sector_agg_hour');


    _q = format('
      UPDATE %s AS measurand
      SET
      level = agg.level
      FROM (SELECT id_entity, (capacity - sum_consumption) AS level
      FROM %s tank
      INNER JOIN (
        SELECT reftank, SUM(consumption) AS sum_consumption
        FROM %s cat
        INNER JOIN (
          SELECT * FROM %s WHERE "TimeInstant" = %5$L) agg
          ON cat.id_entity = agg.id_entity GROUP BY reftank) sect
          ON tank.id_entity = sect.reftank) agg
      WHERE (measurand.id_entity = agg.id_entity AND measurand."TimeInstant" = %5$L);
      ',
      table_tank_measurand, table_tank, table_sector_lastdata, table_sector_agg, moment
    );


    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
