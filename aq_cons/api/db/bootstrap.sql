/*
 * Script to load all PL/PgSQL functions
 */

-- AquaGIS Consumption functions
\ir common/urbo_aq_cons_agg_cons_fore_hourly.sql
\ir common/urbo_aq_cons_agg_hourly.sql
\ir common/urbo_aq_cons_are_leakages_per_sector.sql
\ir common/urbo_aq_cons_propagate_to_plot_hourly.sql
\ir common/urbo_aq_cons_propagate_to_sector.sql

-- DDL & DML
\ir common/ddl/urbo_createtables_aq_cons.sql
\ir common/dml/urbo_createmetadata_aq_cons.sql
