/*
 * Function to propagate AquaGIS Flow and Pressure from constructions to sectors.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_propagate_to_sector('scope', '2018-01-10T08:15:00.000Z', 5);
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_propagate_to_sector(varchar, timestamp, integer);

CREATE OR REPLACE FUNCTION urbo_aq_cons_propagate_to_sector(
    id_scope varchar,
    moment timestamp,
    minutes integer
  )
  RETURNS void AS
  $$
  DECLARE
    _something text;
  BEGIN



  END;
  $$ LANGUAGE plpgsql;
