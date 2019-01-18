/*
 * Function to calculate AquaGIS Comsuption or Forecast in Puerto Real constructions.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_puertoreal('scope', '2018-01-10T08:00:00.000Z', 5);
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_propagate_lastdata_puertoreal(varchar, text, text, text);

CREATE OR REPLACE FUNCTION urbo_aq_cons_propagate_lastdata_puertoreal(
    id_scope varchar,
    id_entity text,
    flow text,
    time_instant text
  )
  RETURNS void AS
  $$
  DECLARE
    id_scope_destination text := 'madrid';
    _q text;
  BEGIN

    IF id_scope = id_scope_destination THEN

      _q := format('
        WITH const_data AS (
          SELECT
              *,
              %1$s as flow,
              0 as pressure,
              ''%4$s''::date as new_time_instant
          FROM
            %2$s.aq_cons_const where id_entity = ''%3$s''
        )
        INSERT INTO
          %2$s.aq_cons_const_lastdata
            (id_entity, position, refsector, refplot, name, floor, complete_plot, usage, pressure, flow, "TimeInstant", created_at, updated_at)
          SELECT
            id_entity, position, refsector, refplot, name, floor, complete_plot, usage, pressure, flow, new_time_instant, created_at, updated_at
          FROM
            const_data
        RETURNING *
        ',
        flow, id_scope_destination, id_entity, time_instant
      );

      RAISE NOTICE '%', _q;
      EXECUTE _q;

    END IF;

  END;
  $$ LANGUAGE plpgsql;
