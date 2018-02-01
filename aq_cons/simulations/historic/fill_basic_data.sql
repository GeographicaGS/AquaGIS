BEGIN;

DELETE FROM aljarafe.aq_cons_plot;
INSERT INTO aljarafe.aq_cons_plot
    (id_entity, "TimeInstant", refsector, description, position, area, floors)
  SELECT id_entity, now() AS "TimeInstant", refsector, description, ST_SetSRID(ST_GeomFromGeoJSON(position), 4326) AS position, area, floors
    FROM aljarafe.aux_plots_catalog;
DELETE FROM aljarafe.aq_cons_plot q0
  WHERE q0.id <> (
    SELECT MAX(q1.id)
      FROM aljarafe.aq_cons_plot q1
      WHERE q0.id_entity = q1.id_entity);

DELETE FROM aljarafe.aq_cons_plot_lastdata;
INSERT INTO aljarafe.aq_cons_plot_lastdata
    (id_entity, "TimeInstant", refsector, description, position, area, floors)
  SELECT id_entity, "TimeInstant", refsector, description, position, area, floors
    FROM aljarafe.aq_cons_plot;

DELETE FROM aljarafe.aq_cons_const;
INSERT INTO aljarafe.aq_cons_const
    (id_entity, "TimeInstant", refplot, refsector, position, name, complete_plot, floor, usage)
  SELECT id_entity, now() AS "TimeInstant", refplot, refsector, ST_SetSRID(ST_MakePoint(x, y), 4326) AS position, name, complete_plot, floor, usage
    FROM aljarafe.aux_constructions_catalog;
DELETE FROM aljarafe.aq_cons_const q0
  WHERE q0.id <> (
    SELECT MAX(q1.id)
      FROM aljarafe.aq_cons_const q1
      WHERE q0.id_entity = q1.id_entity);

DELETE FROM aljarafe.aq_cons_const_lastdata;
INSERT INTO aljarafe.aq_cons_const_lastdata
    (id_entity, "TimeInstant", refplot, refsector, position, name, complete_plot, floor, usage)
  SELECT id_entity, "TimeInstant", refplot, refsector, position, name, complete_plot, floor, usage
    FROM aljarafe.aq_cons_const;

DELETE FROM aljarafe.aq_cons_const_measurand;
INSERT INTO aljarafe.aq_cons_const_measurand
    (id_entity, "TimeInstant", pressure, flow)
  SELECT id_entity, "TimeInstant", pressure, flow
    FROM aljarafe.aux_constructions;

DELETE FROM aljarafe.aq_aux_const_futu;
INSERT INTO aljarafe.aq_aux_const_futu
    (id_entity, "TimeInstant", pressure, flow)
  SELECT id_entity, "TimeInstant", pressure, flow
    FROM aljarafe.aux_constructions_future;

COMMIT;
