/*
 * Function to calculate AquaGIS Comsuption or Forecast in constructions, plots or sectors.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_agg_hourly('scope', '2018-01-10T08:00:00.000Z');
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_agg_hourly(varchar, timestamp);
DROP FUNCTION IF EXISTS urbo_aq_cons_agg_hourly(varchar, timestamp, boolean);

CREATE OR REPLACE FUNCTION urbo_aq_cons_agg_hourly(
    id_scope varchar,
    moment timestamp
  )
  RETURNS void AS
  $$
  DECLARE
    _q text;
  BEGIN

    _q := format('
      SELECT urbo_aq_cons_agg_realtime_hourly(''%s'', ''%s'');
      SELECT urbo_aq_cons_agg_forecast_hourly(''%s'', ''%s'');
      SELECT urbo_aq_cons_leak_detection_hourly(''%s'', ''%s'');
      ',
      id_scope, moment, _boolean,
      id_scope, moment, _boolean,
      id_scope, moment
    );

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
