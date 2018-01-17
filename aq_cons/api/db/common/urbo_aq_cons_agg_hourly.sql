/*
 * Function to calculate AquaGIS Consuption or Forecast in constructions or sectors.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_agg_hourly('scope', '2018-01-10T08:00:00.000Z');
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_agg_hourly(varchar, timestamp);

CREATE OR REPLACE FUNCTION urbo_aq_cons_agg_hourly(
    id_scope varchar,
    moment timestamp
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

    _q := format('
      SELECT urbo_aq_cons_agg_cons_fore_hourly(''%s'', ''%s'', ''aq_cons_const_agg_hour'', ''aq_cons_const_measurand'', NULL, ''consumption'');
      SELECT urbo_aq_cons_agg_cons_fore_hourly(''%s'', ''%s'', ''aq_cons_sector_agg_hour'', ''aq_cons_sector_measurand'', NULL, ''consumption'');
      SELECT urbo_aq_cons_agg_cons_fore_hourly(''%s'', ''%s'', ''aq_cons_const_agg_hour'', ''aq_aux_const_futu'', NULL, ''forecast'');
      SELECT urbo_aq_cons_agg_cons_fore_hourly(''%s'', ''%s'', ''aq_cons_sector_agg_hour'', ''aq_aux_const_futu'', ''aq_cons_const'', ''forecast'');
      SELECT urbo_aq_cons_agg_cons_fore_hourly(''%s'', ''%s'', ''aq_cons_const_agg_hour'', ''aq_aux_const_futu'', NULL, ''pressure'');
      SELECT urbo_aq_cons_agg_cons_fore_hourly(''%s'', ''%s'', ''aq_cons_sector_agg_hour'', ''aq_aux_const_futu'', ''aq_cons_const'', ''pressure'');
      SELECT urbo_aq_cons_propagate_to_plot_hourly(''%s'', ''%s'');
      ',
      id_scope, moment,
      id_scope, moment,
      id_scope, moment,
      id_scope, moment,
      id_scope, moment,
      id_scope, moment,
      id_scope, moment
    );

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
