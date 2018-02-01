# Usage

There are 5 parameters:

* simulation_file -> The configuration file that define the simulation
* from_date -> The date which start the simulation. Format: ISO 8601
* to_date -> The date which finish the simulation. Format: ISO 8601
* frequency -> Time frequency between dates. In Pandas format (eg. "H", "15T", etc...)
* chunk [optional] -> Chunk size. Integer
* plot [optional] -> The plot file to generate its statics


``
python simulator.py simulation_file.json "2018-01-01T00:00:00.000Z" "2018-01-31T23:59:00.000Z" "H" --chunk 2000000 --plot plot_file.json
``