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
    _tb_arr text[];
    _checktable text;
    _pg_geom_idx text;
    _geom_fld text;
    _pg_pk text;
    _pg_tbowner text;
    _ddl_qry text;
    _create_tbs text;
    _time_idx text;
    _ld_unique text;

    _tb_issues text;
    _tb_status text;
    _tb_files text;
  BEGIN

    _tb_issues = urbo_get_table_name(id_scope, 'maintenance_issues');
    _tb_status = urbo_get_table_name(id_scope, 'maintenance_status');
    _tb_files = urbo_get_table_name(id_scope, 'maintenance_files');

    _tb_arr = ARRAY[
        _tb_issues,
        _tb_status,
        _tb_files
      ];

    _checktable = urbo_checktable_ifexists_arr(id_scope,_tb_arr,TRUE);

    IF _checktable then
      RETURN;
    END IF;

    _geom_fld = 'position';

    _pg_geom_idx = urbo_geom_idx_qry('position', _tb_arr);

    _pg_pk = urbo_pk_qry(_tb_arr);

    _pg_tbowner = urbo_tbowner_qry(_tb_arr);

    DROP TYPE IF EXISTS order_type;
    CREATE TYPE order_type AS ENUM (
      'infrastructure update',
      'maintenance',
      'fault',
      'leak'
    );

    DROP TYPE IF EXISTS status_type;
    CREATE TYPE status_type AS ENUM (
      'registered',
      'in progress',
      'incident',
      'leak'
    );

    _create_tbs = format('

      --ISSUES
      CREATE TABLE IF NOT EXISTS %s (
          position geometry(Point,4326),
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
    _tb_issues,
    _tb_status,
    _tb_files
    );

    _ddl_qry = format('
      %s
      %s
      %s
      %s
      ',
      _create_tbs,
      _pg_geom_idx,
      _pg_pk,
      _pg_tbowner
    );

    IF isdebug IS TRUE then
      RAISE NOTICE '%', _ddl_qry;
    END IF;

    EXECUTE _ddl_qry;


  END;
  $$ LANGUAGE plpgsql;
