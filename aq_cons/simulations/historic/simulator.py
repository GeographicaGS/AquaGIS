import sys
import json
import pandas as pd
import collections
from pathlib import Path
from datetime import datetime


def generate_static_entities(file):
    data_json = json.load(file)

    data_in_dict = collections.defaultdict(list)

    for entity in data_json['entities']:
        data_in_dict['id_entity'].append(entity['entity_name'])

        for static_attribute in entity['staticAttributes']:
            if static_attribute['name'] == 'location':
                data_in_dict['x'].append(static_attribute['value']['coordinates'][0])
                data_in_dict['y'].append(static_attribute['value']['coordinates'][1])
            else:
                data_in_dict[static_attribute['name']].append(static_attribute['value'])

    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)

    dataframe = pd.DataFrame(data=data_in_dict)
    dataframe.to_csv(output_dir / 'static_entities-{}.csv'.format(datetime.now().strftime('%d-%m-%Y_%H:%M:%S')),
                     index=False, encoding='utf-8')



if __name__ == '__main__':

    if len(sys.argv) != 4:
        print('Error: parameters are incorrect')
        print('Usage: python {} {} {} {}'.format(sys.argv[0], '<SIMULATION_FILE>', '<FROM>', '<TO>'))
        raise SystemExit
    else:
        simulation_file_path = sys.argv[1]
        from_timestamp = sys.argv[2]
        to_timestamp = sys.argv[3]

    with open(simulation_file_path) as simulation_file:
        generate_static_entities(simulation_file)

