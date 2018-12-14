/*
 * Function to create AquaGIS Maintenance category tables.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_createtables_aq_maintenance('scope', FALSE, FALSE, 'carto_user');
--------------------------------------------------------------------------------


DROP FUNCTION IF EXISTS urbo_createtables_aq_maintenance(text, boolean, boolean, text);

CREATE OR REPLACE FUNCTION urbo_createtables_aq_maintenance(
    id_scope text,
    isdebug boolean DEFAULT FALSE,
    iscarto boolean DEFAULT FALSE,
    cartouser text DEFAULT NULL
  )
  RETURNS void AS
  $$
  DECLARE
    _tb_order text;
    _tb_status text;
    _tb_file text;
  BEGIN

    _tb_order = urbo_get_table_name(id_scope, 'maintenance_order', iscarto);
    _tb_status = urbo_get_table_name(id_scope, 'maintenance_status', iscarto);
    _tb_file = urbo_get_table_name(id_scope, 'maintenance_file', iscarto);

    _tb_arr = ARRAY[
        _tb_order,
        _tb_status,
        _tb_file
      ];

    _checktable = urbo_checktable_ifexists_arr(id_scope,_tb_arr,TRUE);

    IF _checktable then
      RETURN;
    END IF;

    _geom_fld = 'position';

    _pg_geom_idx = urbo_geom_idx_qry(_geom_fld, _tb_arr);

    _pg_pk = urbo_pk_qry(_tb_arr);

    _pg_tbowner = urbo_tbowner_qry(_tb_arr);


    CREATE TYPE order_type AS ENUM ('actualización de infraestructuras', 'mantenimiento', 'avería', 'fuga');
    CREATE TYPE status_type AS ENUM ('registrada', 'en proceso', 'incidencia', 'fuga');

    _create_tbs = format('

    --ORDERS
    CREATE TABLE IF NOT EXISTS %s (
        %I geometry(Point,4326),
        number character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        type order_type NOT NULL,
        address text,
        description text,
        id_user text,
        budget double precision,
        estimated_time double precision,
        current_status status_type,
        -- status jsonb,
        -- files jsonb,
        id_entity character varying(64) NOT NULL,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
    );

    --STATUS
    CREATE TABLE IF NOT EXISTS %s (
        type status_type NOT NULL,
        id_user text,
        id_entity character varying(64) NOT NULL,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
    );

    --FILES
    CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
    );

    ',
    _tb_order, _geom_fld,
    _tb_status,
    _tb_file,
    );

    _time_idx = urbo_time_idx_qry(_tb_arr);
    _ld_unique = urbo_unique_lastdata_qry(ARRAY[_tb_lastdata_wcn, _tb_catalogue_wcm, _tb_areas]::text[]);

    IF iscarto IS TRUE then
      _ddl_qry = format('
        %s
        %s
        %s
        %s
        -- FOR TORQUE VIEW
        CREATE VIEW %s AS SELECT * FROM %s;
        GRANT SELECT ON %s TO publicuser;
        GRANT SELECT ON %s TO publicuser;
        ',
        _create_tbs, _cartodbfy, _time_idx, _ld_unique,
        _tb_lastdata_view_wcn, _tb_lastdata_wcn,
        _tb_lastdata_view_wcn, _tb_agg_wcn01
      );
    ELSE
      _ddl_qry = format('
        %s
        %s
        %s
        %s
        %s
        %s
        %s',
        _create_tbs, _pg_geom_idx, _pg_pk,
        _pg_tbowner,_pg_indicators_tb,
        _time_idx, _ld_unique
      );
    END IF;

    IF isdebug IS TRUE then
      RAISE NOTICE '%', _ddl_qry;
    END IF;

    EXECUTE _ddl_qry;

  END;
  $$ LANGUAGE plpgsql;
