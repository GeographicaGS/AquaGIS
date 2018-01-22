/*
 * Function to calculate AquaGIS Comsuption or Forecast in constructions or sectors.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_propagate('scope', '2018-01-10T08:00:00.000Z', 5);
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_propagate(varchar, timestamp, integer);

CREATE OR REPLACE FUNCTION urbo_aq_cons_propagate(
    id_scope varchar,
    moment timestamp,
    minutes integer
  )
  RETURNS void AS
  $$
  DECLARE
    _q text;
  BEGIN

    _q := format('
      SELECT urbo_aq_cons_propagate_to_plot(''%s'', ''%s'', %s);
      SELECT urbo_aq_cons_propagate_to_sector(''%s'', ''%s'', %s);
      ',
      id_scope, moment, minutes,
      id_scope, moment, minutes
    );

    EXECUTE _q;

  END;
  $$ LANGUAGE plpgsql;
