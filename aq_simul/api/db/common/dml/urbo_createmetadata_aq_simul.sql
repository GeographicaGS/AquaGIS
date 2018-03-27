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
  DECLARE
  	_tb_categories text;
    _tb_entities text;
    _dml_qry text;
  BEGIN

  	_tb_categories = urbo_get_table_name('metadata', 'categories');
    _tb_entities = urbo_get_table_name('metadata', 'entities');

    _dml_qry = format('
      -- CATEGORIES
      INSERT INTO %s
          (id_category, category_name, nodata, config)
        VALUES
          (''aq_simul'', ''Simulación'', FALSE, ''{"carto": {"account": "urbo-default"}}'');

      -- STATIC ENTITIES
      INSERT INTO %s
          (id_entity, entity_name, id_category, table_name, mandatory, editable)
        VALUES
          (''aq_cata.plot_simulation'', ''Simulación de parcelas'', ''aq_simul'', ''aq_cata_plot_simulation'', FALSE, FALSE),
          (''aq_cata.const_simulation'', ''Simulación de construcciones'', ''aq_simul'', ''aq_cata_const_simulation'', FALSE, FALSE),
          (''aq_cata.const_type'', ''Tipos de contrucciones'', ''aq_simul'', ''aq_cata_const_type'', FALSE, FALSE);
    ',
    _tb_categories, _tb_entities
    );
         
    IF isdebug IS TRUE then
      RAISE NOTICE '%', _dml_qry;
    END IF;

    EXECUTE _dml_qry;

  	EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'METADATA FOR aq_simul CATEGORY ALREADY EXISTS';

  END;
  $$ LANGUAGE plpgsql;
