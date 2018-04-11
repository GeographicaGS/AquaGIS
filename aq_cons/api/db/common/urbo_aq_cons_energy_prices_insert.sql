DROP FUNCTION IF EXISTS urbo_simulate_energy_prices(varchar, timestamp, boolean);

CREATE OR REPLACE FUNCTION urbo_simulate_energy_prices(
		id_scope varchar,
		isdebug boolean DEFAULT FALSE,
    	iscarto boolean DEFAULT FALSE
	)
	RETURNS void AS
	$$
	DECLARE
		_tb_aux_energy_prices text;
		_csv_filepath text;
		_q text;
	BEGIN
		_tb_aux_energy_prices = urbo_get_table_name(id_scope, 'aq_aux_energy_prices', iscarto);
		_csv_filepath = 'common/resources/energy_prices.csv';
		_q = format('
			DELETE FROM %1$s;
			COPY %1$s FROM ''%2$s'' DELIMITER '','' CSV HEADER;
		', _tb_aux_energy_prices, _csv_filepath);

		IF isdebug IS TRUE THEN
	      RAISE NOTICE '%', _q;
	    END IF;

	    EXECUTE _q;
	END;
  $$ LANGUAGE plpgsql;