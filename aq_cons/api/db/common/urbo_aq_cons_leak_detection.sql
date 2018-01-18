/*
 * Function to detetects leak besed on rules
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_leak_detection('scope', '2018-01-17T13:00:00.000Z');
--------------------------------------------------------------------------------

DROP TYPE IF EXISTS aq_cons_rule;

CREATE TYPE aq_cons_rule AS (
  consumption double precision,
  pressure double precision,
  time double precision,
  status integer
);

DROP TYPE IF EXISTS aq_cons_sector_data;

CREATE TYPE aq_cons_sector_data AS (
  id_entity character varying(64),
  consumption double precision,
  consumption_forecast double precision,
  pressure double precision,
  pressure_forecast double precision
);

DROP FUNCTION IF EXISTS urbo_aq_cons_leak_detection(varchar, timestamp);

CREATE OR REPLACE FUNCTION urbo_aq_cons_leak_detection(
  id_scope varchar,
  moment timestamp
)
RETURNS void AS
$$
DECLARE
  _q text;
  _r record;
  _rule aq_cons_rule;
  _sector_data aq_cons_sector_data;
  _t_rules text;
  _t_const_sector_agg_hour text;
  _increase_consumption double precision;
  _increase_pressure double precision;
  _consumption_rule_result boolean;
  _pressure_rule_result boolean;
  _leak_status JSON;
BEGIN

  _t_rules := urbo_get_table_name(id_scope, 'aq_aux_leak_rules');
  _t_const_sector_agg_hour := urbo_get_table_name(id_scope, 'aq_cons_sector_agg_hour');
  _leak_status = '{}'::json;

  _q := format('
    SELECT consumption, pressure, time, status FROM %s
  ', _t_rules)
  ;
  FOR _rule IN EXECUTE _q
  LOOP
    _q := format('
      SELECT id_entity, SUM(consumption) as consumption, SUM(forecast) as consumption_forecast, AVG(pressure_agg) as pressure, AVG(pressure_forecast) as pressure_forecast
        FROM %s
        WHERE "TimeInstant" > ''%s''::timestamp - interval ''%s second''
        AND "TimeInstant" <= ''%s''::timestamp
        GROUP BY id_entity
    ', _t_const_sector_agg_hour, moment, _rule.time, moment)
    ;

    FOR _sector_data IN EXECUTE _q
    LOOP

      _increase_consumption := (_sector_data.consumption - _sector_data.consumption_forecast) / _sector_data.consumption_forecast * 100;
      _increase_pressure := (_sector_data.pressure - _sector_data.pressure_forecast) / _sector_data.pressure_forecast * 100;

      RAISE NOTICE '%', _increase_consumption;
      RAISE NOTICE '%', _increase_pressure;

      _q := format('
          SELECT urbo_aq_cons_leak_check_rule(%s, %s)
      ', COALESCE(_rule.consumption::text, 'NULL'), COALESCE(_increase_consumption::text, 'NULL'));
      EXECUTE _q INTO _consumption_rule_result;

      _q := format('
          SELECT urbo_aq_cons_leak_check_rule(%s, %s)
      ', COALESCE(_rule.pressure::text, 'NULL'), COALESCE(_increase_pressure::text, 'NULL'));
      EXECUTE _q INTO _pressure_rule_result;

      IF _consumption_rule_result AND _pressure_rule_result
      THEN
        --_leak_status = GREATEST(leak_status, _rule.status);
      --   -- select COALESCE(leak_status, 0) FROM aljarafe.aq_cons_sector_lastdata
      --   UPDATE aljarafe.aq_cons_sector_lastdata
      --   SET leak_status = %s
      --   WHERE id_entity = %s;
      --
      --
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS urbo_aq_cons_leak_check_rule(double precision, double precision);

CREATE OR REPLACE FUNCTION urbo_aq_cons_leak_check_rule(
  rule double precision,
  value double precision
)
RETURNS boolean AS
$$
BEGIN
  IF rule IS NOT NULL AND (
    (rule < 0 AND  value <= rule) OR
    (rule > 0 AND value >= rule)
  )
  THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

SELECT urbo_aq_cons_leak_detection('aljarafe', '2018-01-17T13:00:00.000Z');
