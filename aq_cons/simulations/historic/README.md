# Usage

There are 5 parameters:

* simulation_file -> The configuration file that define the simulation
* from_date -> The date which start the simulation. Format: %d/%m/%Y %H:%M
* to_date -> The date which finish the simulation. Format: %d/%m/%Y %H:%M
* frequency -> Time frequency between dates. In Pandas format (eg. "H", "15T", etc...)
* chunk [optional] -> Chunk size. Integer


``
python simulator.py simulation_file.json "01/01/2018 00:00" "31/01/2018 23:59" "H" --chunk 2000000
``