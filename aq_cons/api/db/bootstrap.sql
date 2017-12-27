/*
 * Script to load all PL/PgSQL functions
 */

-- AquaGIS Consumption functions
-- \ir common/urbo_aq_cons_function_name.sql

-- DDL & DML
\ir common/ddl/urbo_createtables_aq_cons.sql
\ir common/dml/urbo_createmetadata_aq_cons.sql
