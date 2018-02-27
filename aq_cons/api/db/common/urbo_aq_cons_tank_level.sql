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
    moment timestamp
  )
  RETURNS void AS
  $$
  DECLARE
    table_tank_measurand text;
    table_tank_lastdata text;
    table_sector_lastdata text;
    table_sector_agg text;

    _q text;

  BEGIN
    table_tank_lastdata := urbo_get_table_name(id_scope, 'aq_cons_tank', FALSE, TRUE);
    table_tank_measurand := urbo_get_table_name(id_scope, 'aq_cons_tank_measurand');

    table_sector_lastdata := urbo_get_table_name(id_scope, 'aq_cons_sector', FALSE, TRUE);
    table_sector_agg := urbo_get_table_name(id_scope, 'aq_cons_sector_agg_hour');


    _q = format('
      WITH consumption_by_tank AS (
        SELECT reftank, SUM(consumption) AS sum_consumption
          FROM %1$s sector_lastdata
          INNER JOIN (
            SELECT *
            FROM %2$s
            WHERE
              "TimeInstant" > %5$L::timestamp - interval ''1h''
              AND "TimeInstant" <= %5$L::timestamp) sector_agg
          ON sector_lastdata.id_entity = sector_agg.id_entity
          GROUP BY reftank
      ),
      _ AS (UPDATE %3$s measurand
        SET level = measurand.level - consumption_by_tank.sum_consumption
        FROM consumption_by_tank
        WHERE "TimeInstant" > %5$L::timestamp - interval ''1h''
          AND "TimeInstant" <= %5$L::timestamp
          AND measurand.id_entity = consumption_by_tank.reftank)

      UPDATE %4$s lastdata
        SET level = lastdata.level - consumption_by_tank.sum_consumption
        FROM consumption_by_tank
        WHERE "TimeInstant" > %5$L::timestamp - interval ''1h''
          AND "TimeInstant" <= %5$L::timestamp
          AND lastdata.id_entity = consumption_by_tank.reftank;
      ',
      table_sector_lastdata, table_sector_agg, table_tank_measurand, table_tank_lastdata, moment
    );


    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
