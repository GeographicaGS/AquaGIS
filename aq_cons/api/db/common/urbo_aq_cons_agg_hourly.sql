/*
 * Function to calculate AquaGIS Comsuption or Forecast in constructions, plots or sectors.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_agg_hourly('scope', '2018-01-10T08:00:00.000Z');
-- SELECT urbo_aq_cons_agg_hourly('scope', '2018-01-16T08:00:00.000Z', TRUE);
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_agg_hourly(varchar, timestamp, boolean);

CREATE OR REPLACE FUNCTION urbo_aq_cons_agg_hourly(
    id_scope varchar,
    moment timestamp,
    only_update_or_insert boolean DEFAULT FALSE
  )
  RETURNS void AS
  $$
  DECLARE
    _boolean text;
    _q text;
  BEGIN

    IF only_update_or_insert IS TRUE THEN
      _boolean := 'TRUE';

    ELSE
      _boolean := 'FALSE';
    END IF;

    _q := format('
      SELECT urbo_aq_cons_agg_realtime_hourly(''%s'', ''%s'', %s);
      SELECT urbo_aq_cons_agg_forecast_hourly(''%s'', ''%s'', %s);
      SELECT urbo_aq_cons_leak_detection_hourly(''%s'', ''%s'');
      ',
      id_scope, moment, _boolean,
      id_scope, moment, _boolean,
      id_scope, moment
    );

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
