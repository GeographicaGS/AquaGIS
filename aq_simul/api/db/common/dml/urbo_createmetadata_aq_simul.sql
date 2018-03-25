/*
 * Function to create AquaGIS Simulation category metadata.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_createmetadata_aq_simul(FALSE);
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_createmetadata_aq_simul(boolean);

CREATE OR REPLACE FUNCTION urbo_createmetadata_aq_simul(
    isdebug boolean DEFAULT FALSE
  )
  RETURNS void AS
  $$
  BEGIN

    # DO NOTHING

  END;
  $$ LANGUAGE plpgsql;
