/*
 * Script to load all PL/PgSQL functions
 */

-- AquaGIS Consumption functions
\ir common/urbo_aq_cons_agg_hourly.sql
\ir common/urbo_aq_cons_agg_realtime_hourly.sql
\ir common/urbo_aq_cons_agg_forecast_hourly.sql
\ir common/urbo_aq_cons_are_leakages_per_sector.sql
\ir common/urbo_aq_cons_leak_detection_hourly.sql
\ir common/urbo_aq_cons_propagate_to_plot.sql
\ir common/urbo_aq_cons_propagate_to_sector.sql
\ir common/urbo_aq_cons_propagate.sql

-- DDL & DML
\ir common/ddl/urbo_createtables_aq_cons.sql
\ir common/dml/urbo_createmetadata_aq_cons.sql

