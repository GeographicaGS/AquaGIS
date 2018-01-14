CREATE TABLE IF NOT EXISTS aq_cons_sector (
  id_entity character varying(64) NOT NULL,
  dateModified timestamp without time zone,
  location geometry(MultiPolygon, 4326),
  usage text,
  name text
);

CREATE TABLE IF NOT EXISTS aq_cons_plot (
  id_entity character varying(64) NOT NULL,
  dateModified timestamp without time zone,
  location geometry(MultiPolygon, 4326),
  refSector character varying(64) NOT NULL,
  description jsonb,
  area double precision NOT NULL,
  floors integer NOT NULL
);

CREATE TABLE IF NOT EXISTS aq_cons_const (
  id_entity character varying(64) NOT NULL,
  dateModified timestamp without time zone,
  location geometry(Point, 4326),  -- A POINT INSIDE ITS PLOT
  refSector character varying(64) NOT NULL,
  refPlot character varying(64) NOT NULL,
  name text,
  floor integer,
  completePlot boolean NOT NULL,
  usage text,
  flow double precision,
  pressure double precision
);

CREATE TABLE IF NOT EXISTS aq_aux_const_futu (
  id_entity character varying(64) NOT NULL,  -- SAME id_entity AS ITS CURRENT CONSTRUCTION
  dateModified timestamp without time zone,
  flow double precision,
  pressure double precision
);

CREATE TABLE IF NOT EXISTS aq_aux_leak (
  id_entity character varying(64) NOT NULL,  -- SAME id_entity AS ITS SECTOR
  dateModified timestamp without time zone,
  isLeakage boolean,
  duration integer,
  flowPerc double precision,
  pressurePerc double precision
);
