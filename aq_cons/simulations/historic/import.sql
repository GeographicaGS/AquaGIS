BEGIN;

DROP TABLE IF EXISTS aljarafe.aux_constructions;
CREATE TABLE aljarafe.aux_constructions
(
  id_entity character varying(64),
  "TimeInstant" timestamp without time zone,
  pressure double precision,
  flow double precision,
  PRIMARY KEY(id_entity, "TimeInstant")
);
COPY aljarafe.aux_constructions (id_entity, "TimeInstant", pressure, flow)
  FROM '/usr/src/api/import_historic/constructions.csv' DELIMITER ',' CSV HEADER;

DROP TABLE IF EXISTS aljarafe.aux_constructions_future;
CREATE TABLE aljarafe.aux_constructions_future
(
  id_entity character varying(64),
  "TimeInstant" timestamp without time zone,
  pressure double precision,
  flow double precision,
  PRIMARY KEY(id_entity, "TimeInstant")
);
COPY aljarafe.aux_constructions_future (id_entity, "TimeInstant", pressure, flow)
  FROM '/usr/src/api/import_historic/constructions_future.csv' DELIMITER ',' CSV HEADER;

DROP TABLE IF EXISTS aljarafe.aux_constructions_catalog;
CREATE TABLE aljarafe.aux_constructions_catalog
(
  id_entity character varying(64),
  complete_plot boolean,
  refsector character varying(64),
  refplot character varying(64),
  name text,
  floor integer,
  usage text,
  x double precision,
  y double precision,
  PRIMARY KEY(id_entity)
);
COPY aljarafe.aux_constructions_catalog (complete_plot, floor, id_entity, name, refplot, refsector, usage, x, y)
  FROM '/usr/src/api/import_historic/constructions_catalog.csv' DELIMITER ',' CSV HEADER;

DROP TABLE IF EXISTS aljarafe.aux_plots_catalog;
CREATE TABLE aljarafe.aux_plots_catalog
(
  id_entity character varying(64),
  refsector character varying(64),
  description jsonb,
  position text,
  area double precision,
  floors integer,
  PRIMARY KEY(id_entity)
);
COPY aljarafe.aux_plots_catalog (area, description, floors, id_entity, position, refsector)
  FROM '/usr/src/api/import_historic/plots_catalog.csv' DELIMITER ',' CSV HEADER;

COMMIT;
