/*
 * Function to calculate AquaGIS Hourly Comsuption in Puerto Real constructions.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_aq_cons_propagate_puertoreal('puertoreal', 'construction_id:P18AA700435A', '0.003940348931355402', '2019-01-18T22:00:00Z');
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_aq_cons_propagate_puertoreal(varchar, text, text, text);

CREATE OR REPLACE FUNCTION urbo_aq_cons_propagate_puertoreal(
    id_scope varchar,
    id_entity text,
    flow text,
    time_instant text
  )
  RETURNS void AS
  $$
  DECLARE
    id_scope_destination text := 'puertoreal';
    _q text;
  BEGIN

    IF id_scope = id_scope_destination THEN

      _q := format('
        WITH const_data AS (
          SELECT
              *,
              %1$s as flow,
              0 as pressure,
              ''%4$s''::timestamp as new_time_instant
          FROM
            %2$s.aq_cons_const where id_entity = ''%3$s''
        )
        INSERT INTO
          %2$s.aq_cons_const_measurand
            (id_entity, "TimeInstant", flow, pressure, created_at, updated_at)
          SELECT
            id_entity, new_time_instant, flow, pressure, created_at, updated_at
          FROM
            const_data
        ON CONFLICT (id_entity, "TimeInstant") DO NOTHING;
        ;




        WITH const_data_lastdata AS (
          SELECT
              *,
              %1$s as flow,
              0 as pressure,
              ''%4$s''::timestamp as new_time_instant
          FROM
            %2$s.aq_cons_const where id_entity = ''%3$s''
        )
        UPDATE
          %2$s.aq_cons_const_lastdata
        SET
          position = const_data_lastdata.position,
          refsector = const_data_lastdata.refsector,
          refplot = const_data_lastdata.refplot,
          name = const_data_lastdata.name,
          floor = const_data_lastdata.floor,
          complete_plot = const_data_lastdata.complete_plot,
          usage = const_data_lastdata.usage,
          pressure = const_data_lastdata.pressure,
          flow = const_data_lastdata.flow,
          "TimeInstant" = const_data_lastdata.new_time_instant,
          created_at = const_data_lastdata.created_at,
          updated_at = const_data_lastdata.updated_at
        FROM
          const_data_lastdata
        WHERE
          const_data_lastdata.id_entity = ''%3$s'';




        WITH const_data_lastdata AS (
          SELECT
              *,
              %1$s as flow,
              0 as pressure,
              ''%4$s''::timestamp as new_time_instant
          FROM
            %2$s.aq_cons_const where id_entity = ''%3$s''
        )
        INSERT INTO
          %2$s.aq_cons_const_lastdata
            (id_entity, position, refsector, refplot, name, floor, complete_plot, usage, pressure, flow, "TimeInstant", created_at, updated_at)
          SELECT
            id_entity, position, refsector, refplot, name, floor, complete_plot, usage, pressure, flow, new_time_instant, created_at, updated_at
          FROM
            const_data_lastdata
          WHERE NOT EXISTS (SELECT 1 FROM %2$s.aq_cons_const_lastdata WHERE id_entity = ''%3$s'');

        ;',
        flow, id_scope_destination, id_entity, time_instant
      );

      RAISE NOTICE '%', _q;
      EXECUTE _q;

    END IF;

  END;
  $$ LANGUAGE plpgsql;
