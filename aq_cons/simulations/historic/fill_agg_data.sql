BEGIN;

CLUSTER aljarafe.aq_cons_const_measurand USING aljarafe_aq_cons_const_measurand_tm_idx;
CLUSTER aljarafe.aq_aux_const_futu USING aljarafe_aq_aux_const_futu_tm_idx;

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
SELECT urbo_aq_cons_agg_forecast_hourly('aljarafe', gs.moment)
  FROM gs;

WITH gs AS (
  SELECT generate_series::timestamp without time zone AS moment
    FROM generate_series('2018-01-01T00:00:00Z',
                         '2018-02-02T09:59:50Z',
                         interval '1 hour')
)
SELECT urbo_aq_cons_propagate('aljarafe', gs.moment, 60),
    urbo_aq_cons_agg_hourly('aljarafe', gs.moment)
  FROM gs;

DROP TABLE IF EXISTS aljarafe.aux_constructions;
DROP TABLE IF EXISTS aljarafe.aux_constructions_future;
DROP TABLE IF EXISTS aljarafe.aux_constructions_catalog;
DROP TABLE IF EXISTS aljarafe.aux_plots_catalog;

COMMIT;
