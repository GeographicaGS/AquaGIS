/*
 * Function to create AquaGIS Consumption category metadata.
 */

--------------------------------------------------------------------------------
-- HOW TO USE:
-- SELECT urbo_createmetadata_aq_cons(FALSE);
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS urbo_createmetadata_aq_cons(boolean);

CREATE OR REPLACE FUNCTION urbo_createmetadata_aq_cons(
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

    _tb_categories = urbo_get_table_name('metadata', 'categories');
    _tb_entities = urbo_get_table_name('metadata', 'entities');
    _tb_variables = urbo_get_table_name('metadata', 'variables');

    _dml_qry = format('
      -- CATEGORIES
      INSERT INTO %s
          (id_category, category_name, nodata, config)
        VALUES
          (''aq_cons'', ''Patrones de consumo'', FALSE, ''{"carto": {"account": "urbo-default"}}'');

      -- ENTITIES
      INSERT INTO %s
          (id_entity, entity_name, id_category, table_name, mandatory, editable)
        VALUES
          (''aq_cons.sector'', ''Sector'', ''aq_cons'', ''aq_cons_sector'', TRUE, FALSE),
          (''aq_cons.plot'', ''Parcela'', ''aq_cons'', ''aq_cons_plot'', FALSE, FALSE),
          (''aq_cons.const'', ''Construcción'', ''aq_cons'', ''aq_cons_const'', FALSE, FALSE),
          (''aq_cons.tank'', ''Depósito'', ''aq_cons'', ''aq_cons_tank'', FALSE, FALSE);;

      -- STATIC ENTITIES
      INSERT INTO %s
          (id_entity, entity_name, id_category, table_name, mandatory, editable)
        VALUES
          (''aq_cata.connections_line'', ''Línea de acometida'', ''aq_cons'', ''aq_cata_connections_line'', FALSE, FALSE),
          (''aq_cata.connections_point'', ''Acometida'', ''aq_cons'', ''aq_cata_connections_point'', FALSE, FALSE),
          (''aq_cata.hydrant_line'', ''Línea de hidrante'', ''aq_cons'', ''aq_cata_hydrant_line'', FALSE, FALSE),
          (''aq_cata.hydrant_point'', ''Hidrante'', ''aq_cons'', ''aq_cata_hydrant_point'', FALSE, FALSE),
          (''aq_cata.plot'', ''Parcela'', ''aq_cons'', ''aq_cata_plot'', FALSE, FALSE),
          (''aq_cata.plot_structure'', ''Construcción'', ''aq_cons'', ''aq_cata_plot_structure'', FALSE, FALSE),
          (''aq_cata.supply_line'', ''Línea de abastecimiento'', ''aq_cons'', ''aq_cata_supply_line'', FALSE, FALSE),
          (''aq_cata.supply_point'', ''Abastecimiento'', ''aq_cons'', ''aq_cata_supply_point'', FALSE, FALSE),
          (''aq_cata.sector'', ''Sector'', ''aq_cons'', ''aq_cata_sector'', FALSE, FALSE),
          (''aq_cata.sensor'', ''Sensor'', ''aq_cons'', ''aq_cata_sensor'', FALSE, FALSE),
          (''aq_cata.valve_line'', ''Línea de válvula'', ''aq_cons'', ''aq_cata_valve_line'', FALSE, FALSE),
          (''aq_cata.valve_point'', ''Válvula'', ''aq_cons'', ''aq_cata_valve_point'', FALSE, FALSE),
          (''aq_cata.well_line'', ''Línea de pozo'', ''aq_cons'', ''aq_cata_well_line'', FALSE, FALSE),
          (''aq_cata.well_point'', ''Pozo'', ''aq_cons'', ''aq_cata_well_point'', FALSE, FALSE);

      -- VARIABLES
      INSERT INTO %s
          (id_variable, id_entity, entity_field, var_name, var_units, var_thresholds, var_agg, var_reverse, config, table_name, type, mandatory, editable)
        VALUES
          (''aq_cons.sector.name'', ''aq_cons.sector'', ''name'', ''Nombre del sector'', NULL, NULL, ''{"NOAGG"}'', FALSE, NULL, NULL, ''catalogue'', FALSE, FALSE),
          (''aq_cons.sector.usage'', ''aq_cons.sector'', ''usage'', ''Uso del agua'', NULL, NULL, ''{"NOAGG"}'', FALSE, NULL, ''aq_cons_sector_measurand'', ''variable'', TRUE, FALSE),
          (''aq_cons.sector.flow'', ''aq_cons.sector'', ''flow'', ''Caudal'', ''m³/h'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": false, "default": false}'', ''aq_cons_sector_measurand'', ''variable'', TRUE, FALSE),
          (''aq_cons.sector.pressure'', ''aq_cons.sector'', ''pressure'', ''Presión'', ''kgf/cm²'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": false, "default": false}'', ''aq_cons_sector_measurand'', ''variable'', TRUE, FALSE),
          (''aq_cons.sector.leak_status'', ''aq_cons.sector'', ''leak_status'', ''Estado de fuga'', NULL, NULL, ''{"MIN", "MAX"}'', FALSE, NULL, ''aq_cons_sector_leak_historic'', ''variable'', TRUE, FALSE),
          (''aq_cons.sector.leak_rule'', ''aq_cons.sector'', ''leak_rule'', ''Descripción de la fuga'', NULL, NULL, ''{"NOAGG"}'', FALSE, NULL, ''aq_cons_sector_leak_historic'', ''variable'', TRUE, FALSE),
          (''aq_cons.sector.consumption'', ''aq_cons.sector'', ''consumption'', ''Consumo'', ''m³'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''aq_cons_sector_agg_hour'', ''aggregated'', TRUE, FALSE),
          (''aq_cons.sector.pressure_agg'', ''aq_cons.sector'', ''pressure_agg'', ''Presión'', ''kgf/cm²'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": false, "default": false}'', ''aq_cons_sector_agg_hour'', ''aggregated'', TRUE, FALSE),
          (''aq_cons.sector.forecast'', ''aq_cons.sector'', ''forecast'', ''Previsión de consumo'', ''m³'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''aq_cons_sector_agg_hour'', ''aggregated'', TRUE, FALSE),
          (''aq_cons.sector.pressure_forecast'', ''aq_cons.sector'', ''pressure_forecast'', ''Previsión de presión'', ''kgf/cm²'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": false, "default": false}'', ''aq_cons_sector_agg_hour'', ''aggregated'', TRUE, FALSE),

          (''aq_cons.plot.description'', ''aq_cons.plot'', ''description'', ''Descripción de la parcela'', NULL, NULL, ''{"NOAGG"}'', FALSE, NULL, NULL, ''catalogue'', FALSE, FALSE),
          (''aq_cons.plot.area'', ''aq_cons.plot'', ''area'', ''Área'', ''m²'', NULL, ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, NULL, NULL, ''catalogue'', TRUE, FALSE),
          (''aq_cons.plot.floors'', ''aq_cons.plot'', ''floors'', ''Número de plantas'', NULL, NULL, ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, NULL, NULL, ''catalogue'', TRUE, FALSE),
          (''aq_cons.plot.usage'', ''aq_cons.plot'', ''usage'', ''Uso del agua'', NULL, NULL, ''{"NOAGG"}'', FALSE, NULL, ''aq_cons_plot_measurand'', ''variable'', TRUE, FALSE),
          (''aq_cons.plot.flow'', ''aq_cons.plot'', ''flow'', ''Caudal'', ''m³/h'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": false, "default": false}'', ''aq_cons_plot_measurand'', ''variable'', TRUE, FALSE),
          (''aq_cons.plot.pressure'', ''aq_cons.plot'', ''pressure'', ''Presión'', ''kgf/cm²'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": false, "default": false}'', ''aq_cons_plot_measurand'', ''variable'', TRUE, FALSE),
          (''aq_cons.plot.consumption'', ''aq_cons.plot'', ''consumption'', ''Consumo'', ''m³'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''aq_cons_plot_agg_hour'', ''aggregated'', TRUE, FALSE),
          (''aq_cons.plot.pressure_agg'', ''aq_cons.plot'', ''pressure_agg'', ''Presión'', ''kgf/cm²'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": false, "default": false}'', ''aq_cons_plot_agg_hour'', ''aggregated'', TRUE, FALSE),
          (''aq_cons.plot.forecast'', ''aq_cons.plot'', ''forecast'', ''Previsión de consumo'', ''m³'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''aq_cons_plot_agg_hour'', ''aggregated'', TRUE, FALSE),
          (''aq_cons.plot.pressure_forecast'', ''aq_cons.plot'', ''pressure_forecast'', ''Previsión de presión'', ''kgf/cm²'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": false, "default": false}'', ''aq_cons_plot_agg_hour'', ''aggregated'', TRUE, FALSE),

          (''aq_cons.const.name'', ''aq_cons.const'', ''name'', ''Nombre de la construcción'', NULL, NULL, ''{"NOAGG"}'', FALSE, NULL, NULL, ''catalogue'', FALSE, FALSE),
          (''aq_cons.const.floor'', ''aq_cons.const'', ''floor'', ''Planta'', NULL, NULL, ''{"AVG", "MIN", "MAX"}'', FALSE, NULL, NULL, ''catalogue'', FALSE, FALSE),
          (''aq_cons.const.complete_plot'', ''aq_cons.const'', ''complete_plot'', ''Parcela completa'', NULL, NULL, ''{"NOAGG"}'', FALSE, NULL, NULL, ''catalogue'', TRUE, FALSE),
          (''aq_cons.const.usage'', ''aq_cons.const'', ''usage'', ''Uso del agua'', NULL, NULL, ''{"NOAGG"}'', FALSE, NULL, NULL, ''catalogue'', TRUE, FALSE),
          (''aq_cons.const.flow'', ''aq_cons.const'', ''flow'', ''Caudal'', ''m³/h'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": false, "default": false}'', ''aq_cons_const_measurand'', ''variable'', TRUE, FALSE),
          (''aq_cons.const.pressure'', ''aq_cons.const'', ''pressure'', ''Presión'', ''kgf/cm²'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": false, "default": false}'', ''aq_cons_const_measurand'', ''variable'', TRUE, FALSE),
          (''aq_cons.const.consumption'', ''aq_cons.const'', ''consumption'', ''Consumo'', ''m³'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''aq_cons_const_agg_hour'', ''aggregated'', TRUE, FALSE),
          (''aq_cons.const.pressure_agg'', ''aq_cons.const'', ''pressure_agg'', ''Presión'', ''kgf/cm²'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": false, "default": false}'', ''aq_cons_sector_agg_hour'', ''aggregated'', TRUE, FALSE),
          (''aq_cons.const.forecast'', ''aq_cons.const'', ''forecast'', ''Previsión de consumo'', ''m³'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''aq_cons_const_agg_hour'', ''aggregated'', TRUE, FALSE),
          (''aq_cons.const.pressure_forecast'', ''aq_cons.const'', ''pressure_forecast'', ''Previsión de presión'', ''kgf/cm²'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": false, "default": false}'', ''aq_cons_const_agg_hour'', ''aggregated'', TRUE, FALSE),

          (''aq_cons.tank.location'', ''aq_cons.tank'', ''location'', ''Localización del depósito'', ''NULL'', ''{}'', ''{"NOAGG"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''NULL'', ''catalogue'', TRUE, FALSE),
          (''aq_cons.tank.capacity'', ''aq_cons.tank'', ''capacity'', ''Capacidad'', ''m³'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''NULL'', ''catalogue'', TRUE, FALSE),
          (''aq_cons.tank.min_level'', ''aq_cons.tank'', ''min_level'', ''Nivel mínimo de llenado'', ''m³'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''NULL'', ''catalogue'', TRUE, FALSE),
          (''aq_cons.tank.max_level'', ''aq_cons.tank'', ''max_level'', ''Nivel máximo de llenado'', ''m³'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''NULL'', ''catalogue'', TRUE, FALSE),
          (''aq_cons.tank.level'', ''aq_cons.tank'', ''level'', ''Nivel de llenado'', ''m³'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''aq_cons_tank_measurand'', ''variable'', TRUE, FALSE),
          (''aq_cons.tank.status'', ''aq_cons.tank'', ''status'', ''Estado del depósito'', ''NULL'', ''{}'', ''{"NOAGG"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''aq_cons_tank_agg_hour'', ''aggregated'', TRUE, FALSE),
          (''aq_cons.tank.electricity_consumption_agg'', ''aq_cons.tank'', ''electricity_consumption_agg'', ''Consumo de electricidad'', ''Kwh'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''aq_cons_tank_agg_hour'', ''aggregated'', TRUE, FALSE),
          (''aq_cons.tank.electricity_consumption_forecast'', ''aq_cons.tank'', ''electricity_consumption_forecast'', ''Previsión de consumo de electricidad'', ''Kwh'', ''{}'', ''{"SUM", "AVG", "MIN", "MAX"}'', FALSE, ''{"active": true, "widget": "variable", "default": true}'', ''aq_cons_tank_agg_hour'', ''aggregated'', TRUE, FALSE);
          ;
      ',
      _tb_categories, _tb_entities, _tb_entities, _tb_variables
    );

    IF isdebug IS TRUE then
      RAISE NOTICE '%', _dml_qry;
    END IF;

    EXECUTE _dml_qry;

  EXCEPTION WHEN unique_violation THEN

    RAISE NOTICE 'METADATA FOR aq_cons CATEGORY ALREADY EXISTS';

  END;
  $$ LANGUAGE plpgsql;
