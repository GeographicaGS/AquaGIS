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
    _tb_leak_historic_sector text;
    _tb_agg_hour_sector text;
    _tb_catalogue_plot text;
    _tb_lastdata_plot text;
    _tb_measurand_plot text;
    _tb_agg_hour_plot text;
    _tb_catalogue_const text;
    _tb_lastdata_const text;
    _tb_measurand_const text;
    _tb_agg_hour_const text;
    _tb_catalogue_tank text;
    _tb_lastdata_tank text;
    _tb_measurand_tank text;
    _tb_agg_hour_tank text;
    _tb_aux_const_futu text;
    _tb_aux_leakage text;
    _tb_aux_leak_rules text;
    _tb_aux_energy_prices text;
    _tb_plan_tank_no_opt text;
    _tb_plan_tank_opt text;
    _tb_plan_tank_emergency text;
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
    _id_entity_idx text;
    _usage_idx text;
    _extra_id_column text;
    _defaults_leak_rules text;
    _ddl_qry text;
  BEGIN

    _tb_catalogue_sector := urbo_get_table_name(id_scope, 'aq_cons_sector', iscarto);
    _tb_lastdata_sector := urbo_get_table_name(id_scope, 'aq_cons_sector', iscarto, TRUE);
    _tb_measurand_sector := urbo_get_table_name(id_scope, 'aq_cons_sector_measurand', iscarto);
    _tb_leak_historic_sector = urbo_get_table_name(id_scope, 'aq_cons_sector_leak_historic', iscarto);
    _tb_agg_hour_sector := urbo_get_table_name(id_scope, 'aq_cons_sector_agg_hour', iscarto);

    _tb_catalogue_plot := urbo_get_table_name(id_scope, 'aq_cons_plot', iscarto);
    _tb_lastdata_plot := urbo_get_table_name(id_scope, 'aq_cons_plot', iscarto, TRUE);
    _tb_measurand_plot := urbo_get_table_name(id_scope, 'aq_cons_plot_measurand', iscarto);
    _tb_agg_hour_plot := urbo_get_table_name(id_scope, 'aq_cons_plot_agg_hour', iscarto);

    _tb_catalogue_const := urbo_get_table_name(id_scope, 'aq_cons_const', iscarto);
    _tb_lastdata_const := urbo_get_table_name(id_scope, 'aq_cons_const', iscarto, TRUE);
    _tb_measurand_const := urbo_get_table_name(id_scope, 'aq_cons_const_measurand', iscarto);
    _tb_agg_hour_const := urbo_get_table_name(id_scope, 'aq_cons_const_agg_hour', iscarto);

    _tb_catalogue_tank := urbo_get_table_name(id_scope, 'aq_cons_tank', iscarto);
    _tb_lastdata_tank := urbo_get_table_name(id_scope, 'aq_cons_tank', iscarto, TRUE);
    _tb_measurand_tank := urbo_get_table_name(id_scope, 'aq_cons_tank_measurand', iscarto);
    _tb_agg_hour_tank := urbo_get_table_name(id_scope, 'aq_cons_tank_agg_hour', iscarto);

    _tb_aux_const_futu = urbo_get_table_name(id_scope, 'aq_aux_const_futu', iscarto);
    _tb_aux_leakage = urbo_get_table_name(id_scope, 'aq_aux_leak', iscarto);
    _tb_aux_leak_rules = urbo_get_table_name(id_scope, 'aq_aux_leak_rules', iscarto);
    _tb_aux_energy_prices = urbo_get_table_name(id_scope, 'aq_aux_energy_prices', iscarto);

    _tb_plan_tank_no_opt = urbo_get_table_name(id_scope, 'aq_plan_tank_pump_no_opt', iscarto);
    _tb_plan_tank_opt = urbo_get_table_name(id_scope, 'aq_plan_tank_pump_opt', iscarto);
    _tb_plan_tank_emergency = urbo_get_table_name(id_scope, 'aq_plan_tank_pump_emergency', iscarto);


    _tb_arr_ld := ARRAY[
        _tb_lastdata_sector, _tb_lastdata_plot, _tb_lastdata_const
      ];

    _tb_arr_bsc := array_cat(_tb_arr_ld,
      ARRAY[
        _tb_catalogue_sector, _tb_catalogue_plot, _tb_catalogue_const
      ]);

    _tb_arr_vars := array_cat(_tb_arr_bsc,
      ARRAY[
        _tb_measurand_sector, _tb_measurand_plot, _tb_measurand_const
      ]);

    _tb_arr_agg := array_cat(_tb_arr_vars,
      ARRAY[
        _tb_agg_hour_sector, _tb_agg_hour_plot, _tb_agg_hour_const, _tb_aux_const_futu,
        _tb_aux_leakage, _tb_leak_historic_sector,
        _tb_plan_tank_no_opt, _tb_plan_tank_opt, _tb_plan_tank_emergency
      ]);

    IF iscarto IS TRUE THEN
      _checktable := urbo_checktable_ifexists_arr(cartouser, _tb_arr_vars);

      IF _checktable THEN
        RETURN;
      END IF;

      _geom_fld := 'the_geom';
      _cartodbfy := urbo_cartodbfy_tables_qry(cartouser, _tb_arr_vars);

    ELSE
      _checktable := urbo_checktable_ifexists_arr(id_scope, _tb_arr_vars, TRUE);

      IF _checktable THEN
        RETURN;
      END IF;

      _geom_fld = 'position';
      _pg_geom_idx = urbo_geom_idx_qry(_geom_fld, _tb_arr_bsc);
      _pg_pk = urbo_pk_qry(_tb_arr_vars);
      _pg_tbowner = format('
        %s
        %s
        ',
        urbo_tbowner_qry(_tb_arr_agg),
        urbo_tbowner_qry(ARRAY[_tb_aux_leak_rules])
      );

    END IF;

    _cr_tbs := format('
      ------------
      -- SECTOR --
      ------------

      -- CATALOGUE
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        %I geometry(MultiPolygon, 4326),
        reftank character varying(64) NOT NULL,
        name text,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- LASTDATA
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        %I geometry(MultiPolygon, 4326),
        reftank character varying(64) NOT NULL,
        usage text,
        name text,
        flow double precision,
        pressure double precision,
        leak_status smallint,
        leak_rule text,
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

      -- LEAK HISTORIC
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        leak_status smallint,
        leak_rule text
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
        usage text,
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


      ------------------
      ------ TANK ------
      ------------------

      -- CATALOGUE
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        %I geometry(Point, 4326),
        location character varying,
        capacity double precision,
        min_level double precision,
        max_level double precision,
        pump_flow double precision,
        pump_power double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- LASTDATA
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        %I geometry(Point, 4326),
        location character varying,
        capacity double precision,
        min_level double precision,
        max_level double precision,
        pump_flow double precision,
        pump_power double precision,
        status character varying,
        level double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- MEASURAND
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        level double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- AGG HOURLY
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        status character varying,
        electricity_consumption double precision,
        electricity_consumption_forecast double precision,
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

      -- LEAK
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        flow_perc double precision,
        pressure_perc double precision,
        performance double precision,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- LEAK RULES
      CREATE TABLE IF NOT EXISTS %s (
        consumption double precision,
        pressure double precision,
        time double precision,
        status integer
      );

      -- ENERGY PRICES
      CREATE TABLE IF NOT EXISTS %s (
        "TimeInstant" timestamp without time zone,
        price double precision
      );

      ----------
      -- PLAN --
      ----------

      -- TANK PUMP NO OPT
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        activated boolean NOT NULL,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- TANK PUMP OPT
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        activated boolean NOT NULL,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      -- TANK PUMP EMERGENCY
      CREATE TABLE IF NOT EXISTS %s (
        id_entity character varying(64) NOT NULL,
        "TimeInstant" timestamp without time zone,
        activated boolean NOT NULL,
        created_at timestamp without time zone DEFAULT timezone(''utc''::text, now()),
        updated_at timestamp without time zone DEFAULT timezone(''utc''::text, now())
      );

      ',
      _tb_catalogue_sector, _geom_fld, _tb_lastdata_sector, _geom_fld,
      _tb_measurand_sector,  _tb_leak_historic_sector, _tb_agg_hour_sector,

      _tb_catalogue_plot, _geom_fld, _tb_lastdata_plot, _geom_fld,
      _tb_measurand_plot, _tb_agg_hour_plot,

      _tb_catalogue_const, _geom_fld, _tb_lastdata_const, _geom_fld,
      _tb_measurand_const, _tb_agg_hour_const,

      _tb_catalogue_tank, _geom_fld, _tb_lastdata_tank, _geom_fld,
      _tb_measurand_tank, _tb_agg_hour_tank,

      _tb_aux_const_futu, _tb_aux_leakage, _tb_aux_leak_rules, _tb_aux_energy_prices,

      _tb_plan_tank_no_opt, _tb_plan_tank_opt, _tb_plan_tank_emergency
    );

    _time_idx := urbo_time_idx_qry(_tb_arr_agg);
    _ld_unique := urbo_unique_lastdata_qry(_tb_arr_ld);

    -- TODO: for
    _usage_idx := format('
      CREATE INDEX IF NOT EXISTS %s_us_idx
        ON %s USING btree (usage);
      CREATE INDEX IF NOT EXISTS %s_us_idx
        ON %s USING btree (usage);
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
      replace(_tb_lastdata_plot, '.', '_'), _tb_lastdata_plot,
      replace(_tb_measurand_plot, '.', '_'), _tb_measurand_plot,
      replace(_tb_catalogue_const, '.', '_'), _tb_catalogue_const,
      replace(_tb_lastdata_const, '.', '_'), _tb_lastdata_const
    );

    -- TODO: for
    _id_entity_idx := format('
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      CREATE INDEX IF NOT EXISTS %s_ent_idx
        ON %s USING btree (id_entity);
      ',
      replace(_tb_catalogue_sector, '.', '_'), _tb_catalogue_sector,
      replace(_tb_lastdata_sector, '.', '_'), _tb_lastdata_sector,
      replace(_tb_measurand_sector, '.', '_'), _tb_measurand_sector,
      replace(_tb_leak_historic_sector, '.', '_'), _tb_leak_historic_sector,
      replace(_tb_agg_hour_sector, '.', '_'), _tb_agg_hour_sector,
      replace(_tb_catalogue_plot, '.', '_'), _tb_catalogue_plot,
      replace(_tb_lastdata_plot, '.', '_'), _tb_lastdata_plot,
      replace(_tb_measurand_plot, '.', '_'), _tb_measurand_plot,
      replace(_tb_agg_hour_plot, '.', '_'), _tb_agg_hour_plot,
      replace(_tb_catalogue_const, '.', '_'), _tb_catalogue_const,
      replace(_tb_lastdata_const, '.', '_'), _tb_lastdata_const,
      replace(_tb_measurand_const, '.', '_'), _tb_measurand_const,
      replace(_tb_agg_hour_const, '.', '_'), _tb_agg_hour_const,
      replace(_tb_aux_const_futu, '.', '_'), _tb_aux_const_futu,
      replace(_tb_aux_leakage, '.', '_'), _tb_aux_leakage,
      replace(_tb_catalogue_tank, '.', '_'), _tb_catalogue_tank,
      replace(_tb_lastdata_tank, '.', '_'), _tb_lastdata_tank,
      replace(_tb_measurand_tank, '.', '_'), _tb_measurand_tank,
      replace(_tb_agg_hour_tank, '.', '_'), _tb_agg_hour_tank,
      replace(_tb_plan_tank_no_opt, '.', '_'), _tb_plan_tank_no_opt,
      replace(_tb_plan_tank_opt, '.', '_'), _tb_plan_tank_opt,
      replace(_tb_plan_tank_emergency, '.', '_'), _tb_plan_tank_emergency
    );

    -- Those tables aren't created with an 'id' column, so...
    -- TODO: for
    _extra_id_column := format('
      ALTER TABLE %s ADD COLUMN id SERIAL PRIMARY KEY;
      ALTER TABLE %s ADD COLUMN id SERIAL PRIMARY KEY;
      ALTER TABLE %s ADD COLUMN id SERIAL PRIMARY KEY;
      ALTER TABLE %s ADD COLUMN id SERIAL PRIMARY KEY;
      ',
      _tb_aux_const_futu, _tb_aux_leakage, _tb_aux_leak_rules,
      _tb_leak_historic_sector
    );

    _defaults_leak_rules = format('
      INSERT INTO %s
          (consumption, pressure, time, status)
        VALUES
          (%s, %s, %s, %s);
      INSERT INTO %s
          (consumption, time, status)
        VALUES
          (%s, %s, %s);
    ',
      _tb_aux_leak_rules, 50, -20, 3600, 2, _tb_aux_leak_rules, 20, 3600, 1
    );

    IF iscarto IS TRUE THEN
      _ddl_qry := format('
        %s
        %s
        %s
        %s
        %s
        %s',
        _cr_tbs, _cartodbfy, _time_idx, _ld_unique, _usage_idx, _id_entity_idx
      );
    ELSE
      _ddl_qry := format('
        %s
        %s
        %s
        %s
        %s
        %s
        %s
        %s
        %s
        %s',
        _cr_tbs, _pg_geom_idx, _pg_pk, _pg_tbowner, _time_idx, _ld_unique,
        _usage_idx, _id_entity_idx, _extra_id_column, _defaults_leak_rules
      );
    END IF;

    IF isdebug IS TRUE THEN
      RAISE NOTICE '%', _ddl_qry;
    END IF;

    EXECUTE _ddl_qry;

  END;
  $$ LANGUAGE plpgsql;
