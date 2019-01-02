/*
 * Function to create AquaGIS Consumption category metadata.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_createmetadata_aq_cons(FALSE);
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_createmetadata_maintenance(boolean);

CREATE OR REPLACE FUNCTION urbo_createmetadata_maintenance(
    isdebug boolean DEFAULT FALSE
  )
  RETURNS void AS
  $$
  DECLARE
    _tb_categories text;
    _tb_entities text;
    _tb_variables text;
    _dml_qry text;
  BEGIN

    _tb_categories  = urbo_get_table_name('metadata', 'categories');
    _tb_entities    = urbo_get_table_name('metadata', 'entities');
    _tb_variables   = urbo_get_table_name('metadata', 'variables');

    _dml_qry = format('

      -- CATEGORIES
      INSERT INTO %1$s
          (id_category,                          category_name,              nodata,           config                                                      )
      VALUES
          (''maintenance'',                      ''Mantenimiento'',          false,            ''{"carto": {"account": "urbo-general"}, "provider": ""}''  )
      ;

      -- ENTITIES
      INSERT INTO %2$s
          (id_entity,                            entity_name,                                  id_category,             table_name,                     mandatory,    editable)
      VALUES
          (''maintenance.issues'',               ''Order de mantenimiento'',                   ''maintenance'',         ''maintenance_issues'',         true,         true    ),
          (''maintenance.status'',               ''Estado del mantenimiento'',                 ''maintenance'',         ''maintenance_status'',         true,         true    ),
          (''maintenance.file'',                 ''Archivo de mantenimiento'',                 ''maintenance'',         ''maintenance_files'',          true,         true    )
      ;

      -- VARIABLES

      ', _tb_categories, _tb_entities );

    IF isdebug IS TRUE then
      RAISE NOTICE '%', _dml_qry;
    END IF;

    EXECUTE _dml_qry;

  EXCEPTION WHEN unique_violation THEN

    RAISE WARNING 'METADATA FOR maintenance CATEGORY ALREADY EXISTS';

  END;
  $$ LANGUAGE plpgsql;
