/*
 * Script to load all PL/PgSQL functions
 */

-- AquaGIS Consumption functions
\ir common/urbo_aq_cons_is_leakage.sql
\ir common/urbo_aq_cons_propagate_to_sector.sql

-- DDL & DML
\ir common/ddl/urbo_createtables_aq_cons.sql
\ir common/dml/urbo_createmetadata_aq_cons.sql
