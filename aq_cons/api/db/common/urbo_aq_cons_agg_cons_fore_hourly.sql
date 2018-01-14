/*
 * Function to calculate AquaGIS Consuption or Forecast in constructions or sectors.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_agg_cons_fore_hourly('scope', '2018-01-10T08:00:00.000Z', 'aq_cons_const_agg_hour', 'aq_cons_const_measurand', NULL, FALSE);
-- SELECT urbo_aq_cons_agg_cons_fore_hourly('scope', '2018-01-10T08:00:00.000Z', 'aq_cons_sector_agg_hour', 'aq_cons_sector_measurand', NULL, FALSE);
-- SELECT urbo_aq_cons_agg_cons_fore_hourly('scope', '2018-01-10T08:00:00.000Z', 'aq_cons_const_agg_hour', 'aq_aux_const_futu', NULL, TRUE);
-- SELECT urbo_aq_cons_agg_cons_fore_hourly('scope', '2018-01-10T08:00:00.000Z', 'aq_cons_sector_agg_hour', 'aq_aux_const_futu', 'aq_cons_const', TRUE);
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_agg_cons_fore_hourly(varchar, timestamp, varchar, varchar, varchar, boolean);

CREATE OR REPLACE FUNCTION urbo_aq_cons_agg_cons_fore_hourly(
    id_scope varchar,
    moment timestamp,
    to_table varchar,
    from_table varchar,
    from_join_table varchar DEFAULT NULL,
    is_forecast boolean DEFAULT FALSE
  )
  RETURNS void AS
  $$
  DECLARE
    _t_to text;
    _t_from text;
    _t_from_join text;
    _variable text;
    _save_moment text;
    _q text;
  BEGIN

    _t_to := urbo_get_table_name(id_scope, to_table);
    _t_from := urbo_get_table_name(id_scope, from_table);
    IF from_join_table IS NOT NULL THEN
      _t_from_join := urbo_get_table_name(id_scope, from_join_table, FALSE, TRUE);
    END IF;

    _variable := 'consumption';
    _save_moment := moment;
    IF is_forecast THEN
      _variable := 'forecast';
      _save_moment := format('%s''::timestamp + interval ''7 days', moment);
      -- Every "TimeInstant" should have and interval of plus 7 days, but the
      -- connector it's ignoring the simulator, so, this interval is only in
      -- "TimeInstant" to save.
    END IF;

    IF from_join_table IS NULL THEN
      _q := format('
        INSERT INTO %s
          (id_entity, "TimeInstant", %s)
        SELECT id_entity, ''%s'' AS "TimeInstant",
            AVG(flow) AS %s
          FROM %s
          WHERE "TimeInstant" >= ''%s''
            AND "TimeInstant" < ''%s''::timestamp + interval ''1 hour''
          GROUP BY id_entity
        ON CONFLICT (id_entity, "TimeInstant")
          DO UPDATE SET %s = EXCLUDED.%s;
        ',
        _t_to, _variable, _save_moment, _variable, _t_from, moment, moment,
        _variable, _variable
      );

    ELSE
      _q := format('
        INSERT INTO %s
          (id_entity, "TimeInstant", %s)
        SELECT cl.refsector AS id_entity, ''%s'' AS "TimeInstant",
            AVG(cf.flow) AS %s
          FROM %s cf
            INNER JOIN %s cl
              ON cf.id_entity = cl.id_entity
          WHERE cf."TimeInstant" >= ''%s''
            AND cf."TimeInstant" < ''%s''::timestamp + interval ''1 hour''
          GROUP BY cl.refsector
        ON CONFLICT (id_entity, "TimeInstant")
          DO UPDATE SET %s = EXCLUDED.%s;
        ',
        _t_to, _variable, _save_moment, _variable, _t_from, _t_from_join, moment,
        moment, _variable, _variable
      );
    END IF;

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
