import sys
import json
import pandas as pd
import collections
import re
import numpy as np
import random
from pathlib import Path
from datetime import datetime
from scipy.interpolate import interp1d
from tqdm import tqdm


def generate_static_entities(data):

    data_in_dict = collections.defaultdict(list)

    for entity in tqdm(data['entities'], desc='Generating statics'):
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


def generate_simulations(data, from_timestamp, to_timestamp):

    parameters = generate_parameters_with_interpolators(data['exports'])
    date_range = pd.date_range(from_timestamp, to_timestamp, freq='15min')

    entities_to_active = dict()

    data_in_dict = collections.defaultdict(list)

    for entity in tqdm(data['entities'], desc='Generating entities and timestamp'):
        entities_to_active[entity['entity_name']] = entity['active']

        for date in date_range:
            data_in_dict['id_entity'].append(entity['entity_name'])
            data_in_dict['timestamp'].append(date)

    dataframe = pd.DataFrame(data=data_in_dict)

    tqdm.pandas(desc='Apply progress')
    dataframe[['pressure', 'flow']] = dataframe.progress_apply(lambda row: calculate_pressure_flow(row, entities_to_active, parameters), axis=1)

    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)

    dataframe.to_csv(output_dir / 'simulations-{}.csv'.format(datetime.now().strftime('%d-%m-%Y_%H:%M:%S')),
                     index=False, encoding='utf-8')


def calculate_pressure_flow(row, actives, parameters_random_function):
    active = actives[row['id_entity']]

    pressure_value = None
    flow_value = None

    for event in active:

        interpolator = event['value'].replace('import(', '').replace(')', '')

        if event['name'] == 'pressure':
            time = row['timestamp'].time()

            parameters = parameters_random_function[interpolator][time]
            pressure_value = random.uniform(*parameters)
        elif event['name'] == 'flow':
            timestamp = row['timestamp']

            if interpolator.endswith('Week') and timestamp.weekday() in range(0, 5):
                parameters = parameters_random_function[interpolator][timestamp.time()]
                flow_value = random.uniform(*parameters)
            elif interpolator.endswith('Weekend') and timestamp.weekday() in (5, 6):
                parameters = parameters_random_function[interpolator][timestamp.time()]
                flow_value = random.uniform(*parameters)

    return pressure_value, flow_value


def generate_parameters_with_interpolators(raw_interpolators):

    interpolator_to_parameters_random = dict()

    range_to_interpolate = np.arange(0, 24, 0.25)
    time_range = [timestamp.time() for timestamp in pd.date_range('00:00', '23:59', freq='15min')]

    for key, body_raw_interpolator in raw_interpolators.items():

        if key not in ('now', 'future'):

            x_regex = re.compile('\[\d+')
            min_regex = re.compile('\(\d+(\.\d+)?')
            max_regex = re.compile('\d+(\.\d+)?\)')

            x = [int(element.group().replace('[', '')) for element in x_regex.finditer(body_raw_interpolator)]
            min_values = [float(element.group().replace('(', '')) for element in min_regex.finditer(body_raw_interpolator)]
            max_values = [float(element.group().replace(')', '')) for element in max_regex.finditer(body_raw_interpolator)]

            f_min_interpolated = interp1d(x, min_values)
            f_max_interpolated = interp1d(x, max_values)

            min_parameters = f_min_interpolated(range_to_interpolate)
            max_parameters = f_max_interpolated(range_to_interpolate)

            parameters_with_rangetime = dict(zip(time_range, zip(min_parameters, max_parameters)))

            interpolator_to_parameters_random[key] = parameters_with_rangetime

    return interpolator_to_parameters_random


if __name__ == '__main__':

    if len(sys.argv) != 4:
        print('Error: parameters are incorrect')
        print('Usage: python {} {} {} {}'.format(sys.argv[0], '<SIMULATION_FILE>', '<FROM>', '<TO>'))
        raise SystemExit
    else:
        simulation_file_path = sys.argv[1]
        from_parameter = sys.argv[2]
        to_parameter = sys.argv[3]

    with open(simulation_file_path) as simulation_file:
        data_json = json.load(simulation_file)

        generate_static_entities(data_json)

        generate_simulations(data_json, from_parameter, to_parameter)
