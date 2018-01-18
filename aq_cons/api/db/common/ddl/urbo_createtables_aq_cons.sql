/*
 * Function to create AquaGIS Consumption category tables.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_createtables_aq_cons('scope', FALSE, FALSE, 'carto_user');
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
    _tb_agg_hour_sector text;
    _tb_catalogue_plot text;
    _tb_lastdata_plot text;
    _tb_measurand_plot text;
    _tb_catalogue_const text;
    _tb_lastdata_const text;
    _tb_measurand_const text;
    _tb_agg_hour_const text;
    _tb_aux_const_futu text;
    _tb_aux_leakage text;
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
    _usage_idx text;
    _extra_id_column text;
    _ddl_qry text;
  BEGIN

    _tb_catalogue_sector = urbo_get_table_name(id_scope, 'aq_cons_sector', iscarto);
    _tb_lastdata_sector = urbo_get_table_name(id_scope, 'aq_cons_sector', iscarto, TRUE);
    _tb_measurand_sector = urbo_get_table_name(id_scope, 'aq_cons_sector_measurand', iscarto);
    _tb_agg_hour_sector = urbo_get_table_name(id_scope, 'aq_cons_sector_agg_hour', iscarto);

    _tb_catalogue_plot = urbo_get_table_name(id_scope, 'aq_cons_plot', iscarto);
    _tb_lastdata_plot = urbo_get_table_name(id_scope, 'aq_cons_plot', iscarto, TRUE);
    _tb_measurand_plot = urbo_get_table_name(id_scope, 'aq_cons_plot_measurand', iscarto);

    _tb_catalogue_const = urbo_get_table_name(id_scope, 'aq_cons_const', iscarto);
    _tb_lastdata_const = urbo_get_table_name(id_scope, 'aq_cons_const', iscarto, TRUE);
    _tb_measurand_const = urbo_get_table_name(id_scope, 'aq_cons_const_measurand', iscarto);
    _tb_agg_hour_const = urbo_get_table_name(id_scope, 'aq_cons_const_agg_hour', iscarto);

    _tb_aux_const_futu = urbo_get_table_name(id_scope, 'aq_aux_const_futu', iscarto);
    _tb_aux_leakage = urbo_get_table_name(id_scope, 'aq_aux_leak', iscarto);

    _tb_arr_ld = ARRAY[
        _tb_lastdata_sector, _tb_lastdata_plot, _tb_lastdata_const
      ];

    _tb_arr_bsc = array_cat(_tb_arr_ld,
      ARRAY[
        _tb_catalogue_sector, _tb_catalogue_plot, _tb_catalogue_const
      ]);

    _tb_arr_vars = array_cat(_tb_arr_bsc,
      ARRAY[
        _tb_measurand_sector, _tb_measurand_plot, _tb_measurand_const
      ]);

    _tb_arr_agg = array_cat(_tb_arr_vars,
      ARRAY[
        _tb_agg_hour_sector, _tb_agg_hour_const, _tb_aux_const_futu,
        _tb_aux_leakage
      ]);

    IF iscarto IS TRUE THEN
      _checktable = urbo_checktable_ifexists_arr(cartouser, _tb_arr_vars);

      IF _checktable THEN
        RETURN;
      END IF;

      _geom_fld = 'the_geom';
      _cartodbfy = urbo_cartodbfy_tables_qry(cartouser, _tb_arr_vars);

    ELSE
      _checktable = urbo_checktable_ifexists_arr(id_scope, _tb_arr_vars, TRUE);

      IF _checktable THEN
        RETURN;
      END IF;

      _geom_fld = 'position';
      _pg_geom_idx = urbo_geom_idx_qry(_geom_fld, _tb_arr_bsc);
      _pg_pk = urbo_pk_qry(_tb_arr_vars);
      _pg_tbowner = urbo_tbowner_qry(_tb_arr_agg);

    END IF;

    _cr_tbs = format('
      ------------
      -- SECTOR --
      ------------

      -- CATALOGUE
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        %I geometry(MultiPolygon, 4326),
        name text,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
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
        usage text,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- AGG HOURLY
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        consumption double precision,
        pressure_agg double precision,
        forecast double precision,
        pressure_forecast double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      ----------
      -- PLOT --
      ----------

      -- CATALOGUE
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        %I geometry(MultiPolygon, 4326),
        refsector character varying(64) NOT NULL,
        description jsonb,
        area double precision,
        floors integer,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- LASTDATA
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        %I geometry(MultiPolygon, 4326),
        refsector character varying(64) NOT NULL,
        description jsonb,
        area double precision NOT NULL,
        floors integer NOT NULL,
        consumption double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- MEASURAND
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        consumption double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      ------------------
      -- CONSTRUCTION --
      ------------------

      -- CATALOGUE
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        %I geometry(Point, 4326),
        refsector character varying(64) NOT NULL,
        refplot character varying(64) NOT NULL,
        name text,
        floor integer,
        complete_plot boolean NOT NULL,
        usage text,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- LASTDATA
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        %I geometry(Point, 4326),
        refsector character varying(64) NOT NULL,
        refplot character varying(64) NOT NULL,
        name text,
        floor integer,
        complete_plot boolean NOT NULL,
        usage text,
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
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- AGG HOURLY
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        consumption double precision,
        pressure_agg double precision,
        forecast double precision,
        pressure_forecast double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      ---------
      -- AUX --
      ---------

      -- CONSTRUCTON FUTURE
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        flow double precision,
        pressure double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- LEAKAGE
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        is_leakage boolean,
        hours double precision,
        flow_perc double precision,
        pressure_perc double precision,
        pressure_variability double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );
      ',
      _tb_catalogue_sector, _geom_fld, _tb_lastdata_sector, _geom_fld,
      _tb_measurand_sector,  _tb_agg_hour_sector,

      _tb_catalogue_plot, _geom_fld, _tb_lastdata_plot, _geom_fld,
      _tb_measurand_plot,

      _tb_catalogue_const, _geom_fld, _tb_lastdata_const, _geom_fld,
      _tb_measurand_const, _tb_agg_hour_const,

      _tb_aux_const_futu, _tb_aux_leakage
    );

    _time_idx = urbo_time_idx_qry(_tb_arr_agg);
    _ld_unique = urbo_unique_lastdata_qry(_tb_arr_ld);

    _usage_idx = format('
      CREATE INDEX IF NOT EXISTS %s_us_idx
        ON %s USING btree (usage);
      CREATE INDEX IF NOT EXISTS %s_us_idx
        ON %s USING btree (usage);
      CREATE INDEX IF NOT EXISTS %s_us_idx
        ON %s USING btree (usage);
      CREATE INDEX IF NOT EXISTS %s_us_idx
        ON %s USING btree (usage);
      ',
      replace(_tb_lastdata_sector, '.', '_'), _tb_lastdata_sector,
      replace(_tb_measurand_sector, '.', '_'), _tb_measurand_sector,
      replace(_tb_catalogue_const, '.', '_'), _tb_catalogue_const,
      replace(_tb_lastdata_const, '.', '_'), _tb_lastdata_const
    );

    -- Those tables aren't crated with an 'id' column, so...
    _extra_id_column = format('
      ALTER TABLE %s ADD COLUMN id SERIAL PRIMARY KEY;
      ALTER TABLE %s ADD COLUMN id SERIAL PRIMARY KEY;
      ',
      _tb_aux_const_futu, _tb_aux_leakage
    );

    IF iscarto IS TRUE THEN
      _ddl_qry = format('
        %s
        %s
        %s
        %s
        %s',
        _cr_tbs, _cartodbfy, _time_idx, _ld_unique, _usage_idx
      );
    ELSE
      _ddl_qry = format('
        %s
        %s
        %s
        %s
        %s
        %s
        %s
        %s',
        _cr_tbs, _pg_geom_idx, _pg_pk, _pg_tbowner, _time_idx, _ld_unique,
        _usage_idx, _extra_id_column
      );
    END IF;

    IF isdebug IS TRUE THEN
      RAISE NOTICE '%', _ddl_qry;
    END IF;

    EXECUTE _ddl_qry;

  END;
  $$ LANGUAGE plpgsql;
