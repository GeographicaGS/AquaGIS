/*
 * Function to create AquaGIS Consumption category tables.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_createtables_aq_cons('my_scope', TRUE, TRUE, 'my_carto_user');
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_createtables_aq_cons(text, boolean, boolean, text);

CREATE OR REPLACE FUNCTION urbo_createtables_aq_cons(
    id_scope text,
    isdebug boolean DEFAULT FALSE,
    iscarto boolean DEFAULT FALSE,
    cartouser text DEFAULT NULL
  )
  RETURNS void AS
  $$
  DECLARE
    _tb_catalogue_sector text;
    _tb_lastdata_sector text;
    _tb_measurand_sector text;
    _tb_forecast_sector text;
    _tb_arr_ld text[];
    _tb_arr_bsc text[];
    _tb_arr_vars text[];
    _tb_arr_agg text[];
    _checktable text;
    _geom_fld text;
    _cartodbfy text;
    _pg_geom_idx text;
    _pg_pk text;
    _pg_tbowner text;
    _cr_tbs text;
    _time_idx text;
    _ld_unique text;
    _ddl_qry text;
  BEGIN

    _tb_catalogue_sector = urbo_get_table_name(id_scope, 'aq_cons_sector', iscarto);
    _tb_lastdata_sector = urbo_get_table_name(id_scope, 'aq_cons_sector', iscarto, true);
    _tb_measurand_sector = urbo_get_table_name(id_scope, 'aq_cons_measurand', iscarto);
    _tb_agg_cons_sector = urbo_get_table_name(id_scope, 'aq_cons_agg_cons', iscarto);
    _tb_agg_forecast_sector = urbo_get_table_name(id_scope, 'aq_cons_agg_forecast', iscarto);

    _tb_arr_ld = ARRAY[
        _tb_lastdata_sector
      ];

    _tb_arr_bsc = array_cat(_tb_arr_ld,
      ARRAY[
        _tb_catalogue_sector
      ]);

    _tb_arr_vars = array_cat(_tb_arr_bsc,
      ARRAY[
        _tb_measurand_sector
      ]);

    _tb_arr_agg = array_cat(_tb_arr_vars,
      ARRAY[
        _tb_agg_cons_sector,
        _tb_agg_forecast_sector
      ]);

    IF iscarto IS TRUE then
      _checktable = urbo_checktable_ifexists_arr(cartouser, _tb_arr_vars);

      IF _checktable then
        RETURN;
      END IF;

      _geom_fld = 'the_geom';
      _cartodbfy = urbo_cartodbfy_tables_qry(cartouser, _tb_arr_vars);

    ELSE
      _checktable = urbo_checktable_ifexists_arr(id_scope, _tb_arr_vars, TRUE);

      IF _checktable then
        RETURN;
      END IF;

      _geom_fld = 'position';
      _pg_geom_idx = urbo_geom_idx_qry(_geom_fld, _tb_arr_bsc);
      _pg_pk = urbo_pk_qry(_tb_arr_vars);
      _pg_tbowner = urbo_tbowner_qry(_tb_arr_agg);

    END IF;

    _cr_tbs = format('
      -- CATALOGUE
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        %I geometry(MultiPolygon, 4326),
        usage text,
        name text,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- LASTDATA
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        %I geometry(MultiPolygon, 4326),
        usage text,
        name text,
        flow double precision,
        pressure double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- MEASURAND
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        flow double precision,
        pressure double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- AGG CONSUMPTION
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        consumption double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- AGG FORECAST
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        forecast double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );
      ',
      _tb_catalogue_sector, _geom_fld, _tb_lastdata_sector, _geom_fld,
      _tb_measurand_sector,  _tb_agg_cons_sector, _tb_agg_forecast_sector);

      _time_idx = urbo_time_idx_qry(_tb_arr_agg);
      _ld_unique = urbo_unique_lastdata_qry(_tb_arr_ld);

      IF iscarto IS TRUE then
        _ddl_qry = format('
          %s
          %s
          %s
          %s',
          _cr_tbs, _cartodbfy, _time_idx, _ld_unique
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
          _cr_tbs, _pg_geom_idx, _pg_pk, _pg_tbowner, _time_idx, _ld_unique
        );
      END IF;

      IF isdebug IS TRUE then
        RAISE NOTICE '%', _ddl_qry;
      END IF;

      EXECUTE _ddl_qry;

    END;
    $$ LANGUAGE plpgsql;
