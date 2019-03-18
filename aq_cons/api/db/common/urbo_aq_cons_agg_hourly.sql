/*
 * Function to calculate AquaGIS Comsuption or Forecast in constructions, plots or sectors.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_agg_hourly('scope', '2018-01-10T08:00:00.000Z');
-- SELECT urbo_aq_cons_agg_hourly('scope', '2018-01-10T08:00:00.000Z', TRUE);
-- SELECT urbo_aq_cons_agg_hourly('scope', '2018-01-10T08:00:00.000Z', FALSE);
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_agg_hourly(varchar, timestamp);
DROP FUNCTION IF EXISTS urbo_aq_cons_agg_hourly(varchar, timestamp, boolean);

CREATE OR REPLACE FUNCTION urbo_aq_cons_agg_hourly(
    id_scope varchar,
    moment timestamp,
    on_conflict boolean DEFAULT FALSE  -- IF FALSE THEN UPDATE (REALTIME) AND REGULAR INSERT (FORECAST)
  )
  RETURNS void AS
  $$
  DECLARE
    _on_conflict text;
    _q text;
  BEGIN

    IF on_conflict IS TRUE THEN
      _on_conflict := 'TRUE';

    ELSE
      _on_conflict := 'FALSE';
    END IF;

    _q := format('
      DELETE from %s.aq_cons_plot_agg_hour where forecast = ''Nan'';
      DELETE from %s.aq_cons_sector_agg_hour where forecast = ''Nan'';
      SELECT urbo_aq_cons_agg_realtime_hourly(''%s'', ''%s'', %s);
      SELECT urbo_aq_cons_agg_forecast_hourly(''%s'', ''%s'', %s);
      SELECT urbo_aq_cons_leak_detection_hourly(''%s'', ''%s'');
      ',
      id_scope,
      id_scope,
      id_scope, moment, _on_conflict,
      id_scope, moment, _on_conflict,
      id_scope, moment
    );

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
