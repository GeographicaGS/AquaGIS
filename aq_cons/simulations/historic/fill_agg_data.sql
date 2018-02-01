BEGIN;

DELETE FROM aljarafe.aq_cons_sector_measurand;
DELETE FROM aljarafe.aq_cons_sector_leak_historic;
DELETE FROM aljarafe.aq_cons_sector_agg_hour;

DELETE FROM aljarafe.aq_cons_plot_measurand;
DELETE FROM aljarafe.aq_cons_plot_agg_hour;

DELETE FROM aljarafe.aq_cons_const_agg_hour;

WITH gs AS (
  SELECT generate_series::timestamp without time zone AS moment
    FROM generate_series('2017-12-18T00:00:00Z',
                         '2017-12-31T23:59:50Z',
                         interval '1 hour')
)
SELECT urbo_aq_cons_agg_cons_fore_hourly('aljarafe', gs.moment, 'aq_cons_const_agg_hour', 'aq_aux_const_futu', NULL, 'forecast'),
    urbo_aq_cons_agg_cons_fore_hourly('aljarafe', gs.moment, 'aq_cons_plot_agg_hour', 'aq_aux_const_futu', 'aq_cons_const', 'forecast'),
    urbo_aq_cons_agg_cons_fore_hourly('aljarafe', gs.moment, 'aq_cons_sector_agg_hour', 'aq_aux_const_futu', 'aq_cons_const', 'forecast'),
    urbo_aq_cons_agg_cons_fore_hourly('aljarafe', gs.moment, 'aq_cons_const_agg_hour', 'aq_aux_const_futu', NULL, 'pressure_forecast'),
    urbo_aq_cons_agg_cons_fore_hourly('aljarafe', gs.moment, 'aq_cons_plot_agg_hour', 'aq_aux_const_futu', 'aq_cons_const', 'pressure_forecast'),
    urbo_aq_cons_agg_cons_fore_hourly('aljarafe', gs.moment, 'aq_cons_sector_agg_hour', 'aq_aux_const_futu', 'aq_cons_const', 'pressure_forecast')
 FROM gs;

WITH gs AS (
  SELECT generate_series::timestamp without time zone AS moment
    FROM generate_series('2018-01-01T00:00:00Z',
                         '2018-02-01T23:59:50Z',
                         interval '1 hour')
)
SELECT urbo_aq_cons_propagate('aljarafe', gs.moment, 60),
    urbo_aq_cons_agg_hourly('aljarafe', gs.moment)
  FROM gs;

-- DELETE FROM aljarafe.aq_cons_const_measurand
--   WHERE "TimeInstant" > '2018-02-01T23:59:50Z';
-- DELETE FROM aljarafe.aq_aux_const_futu
--   WHERE "TimeInstant" > '2018-02-15T23:59:50Z';

DROP TABLE aljarafe.aux_constructions;
DROP TABLE aljarafe.aux_constructions_future;
DROP TABLE aljarafe.aux_constructions_catalog;
DROP TABLE aljarafe.aux_plots_catalog;

COMMIT;
