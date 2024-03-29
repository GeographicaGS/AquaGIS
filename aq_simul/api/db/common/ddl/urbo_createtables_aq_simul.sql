/*
 * Function to create AquaGIS Simulation category tables.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_createtables_aq_simul('scope', FALSE, FALSE, 'carto_user');
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_createtables_aq_simul(text, boolean, boolean, text);

CREATE OR REPLACE FUNCTION urbo_createtables_aq_simul(
    id_scope text,
    isdebug boolean DEFAULT FALSE,
    iscarto boolean DEFAULT FALSE,
    cartouser text DEFAULT NULL
  )
  RETURNS void AS
  $$
  BEGIN

    -- DO NOTHING
    -- MUST CREATE STATIC TABLES

  END;
  $$ LANGUAGE plpgsql;
