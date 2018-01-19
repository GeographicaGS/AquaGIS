/*
 * Function to calculate AquaGIS Consuption or Forecast in constructions or sectors.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_agg_cons_fore_hourly('scope', '2018-01-16T08:00:00.000Z', 'aq_cons_const_agg_hour', 'aq_cons_const_measurand', NULL, 'consumption');
-- SELECT urbo_aq_cons_agg_cons_fore_hourly('scope', '2018-01-16T08:00:00.000Z', 'aq_cons_sector_agg_hour', 'aq_cons_sector_measurand', NULL, 'consumption');
-- SELECT urbo_aq_cons_agg_cons_fore_hourly('scope', '2018-01-16T08:00:00.000Z', 'aq_cons_const_agg_hour', 'aq_aux_const_futu', NULL, 'forecast');
-- SELECT urbo_aq_cons_agg_cons_fore_hourly('scope', '2018-01-16T08:00:00.000Z', 'aq_cons_sector_agg_hour', 'aq_aux_const_futu', 'aq_cons_const', 'forecast');
-- SELECT urbo_aq_cons_agg_cons_fore_hourly('scope', '2018-01-16T08:00:00.000Z', 'aq_cons_const_agg_hour', 'aq_aux_const_futu', NULL, 'pressure');
-- SELECT urbo_aq_cons_agg_cons_fore_hourly('scope', '2018-01-16T08:00:00.000Z', 'aq_cons_sector_agg_hour', 'aq_aux_const_futu', 'aq_cons_const', 'pressure');
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_agg_cons_fore_hourly(varchar, timestamp, varchar, varchar, varchar, varchar);


CREATE OR REPLACE FUNCTION urbo_aq_cons_agg_cons_fore_hourly(
    id_scope varchar,
    moment timestamp,
    to_table varchar,
    from_table varchar,
    from_join_table varchar DEFAULT NULL,
    variable varchar DEFAULT 'consumption'
  )
  RETURNS void AS
  $$
  DECLARE
    _t_to text;
    _t_from text;
    _t_from_join text;
    _save_moment text;
    _from_variable text;
    _q text;
  BEGIN

    _t_to := urbo_get_table_name(id_scope, to_table);
    _t_from := urbo_get_table_name(id_scope, from_table);
    IF from_join_table IS NOT NULL THEN
      _t_from_join := urbo_get_table_name(id_scope, from_join_table, FALSE, TRUE);
    END IF;

    _save_moment := moment;
    IF variable <> 'consumption' AND variable <> 'pressure_agg' THEN
      _save_moment := format('%s''::timestamp + interval ''14 days', moment);
      -- Every "TimeInstant" should have and interval of plus 14 days, but the
      -- connector it's ignoring the simulator, so, this interval is only in
      -- "TimeInstant" to save.
    END IF;

    _from_variable := 'flow';
    IF variable ilike 'pressure_%' THEN
      _from_variable := 'pressure';
    END IF;

    IF from_join_table IS NULL THEN
      _q := format('
        INSERT INTO %s
          (id_entity, "TimeInstant", %s)
        SELECT id_entity, ''%s'' AS "TimeInstant",
            AVG(%s) AS %s
          FROM %s
          WHERE "TimeInstant" >= ''%s''
            AND "TimeInstant" < ''%s''::timestamp + interval ''1 hour''
          GROUP BY id_entity
        ON CONFLICT (id_entity, "TimeInstant")
          DO UPDATE SET %s = EXCLUDED.%s;
        ',
        _t_to, variable, _save_moment, _from_variable, variable,
        _t_from, moment, moment, variable, variable
      );

    ELSE
      _q := format('
        INSERT INTO %s
          (id_entity, "TimeInstant", %s)
        SELECT cl.refsector AS id_entity, ''%s'' AS "TimeInstant",
            SUM(cf.%s) AS %s
          FROM (
            SELECT id_entity, AVG(%s) AS %s
              FROM %s
              WHERE "TimeInstant" >= ''%s''
                AND "TimeInstant" < ''%s'' + interval ''1 hour''
              GROUP BY id_entity
          ) cf
            INNER JOIN %s cl
              ON cf.id_entity = cl.id_entity
          GROUP BY cl.refsector
        ON CONFLICT (id_entity, "TimeInstant")
          DO UPDATE SET %s = EXCLUDED.%s;
        ',
        _t_to, variable, _save_moment, _from_variable, variable,
        _from_variable, _from_variable, _t_from, _save_moment, _save_moment,
        _t_from_join, variable, variable
      );
    END IF;

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
