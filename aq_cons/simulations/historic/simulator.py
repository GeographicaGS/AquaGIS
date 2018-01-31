import json
import pandas as pd
import collections
import re
import numpy as np
import random
import gc
import multiprocessing
import argparse
from pathlib import Path
from datetime import datetime, timedelta
from scipy.interpolate import interp1d
from tqdm import tqdm


def generate_static(data, type_entity):

    data_in_dict = collections.defaultdict(list)

    for entity in tqdm(data['entities'], desc='Generating {} statics'.format(type_entity)):
        data_in_dict['id_entity'].append(entity['entity_name'])

        for static_attribute in entity['staticAttributes']:
            if static_attribute['name'] == 'location' and type_entity == 'entities':
                data_in_dict['x'].append(static_attribute['value']['coordinates'][0])
                data_in_dict['y'].append(static_attribute['value']['coordinates'][1])
            elif static_attribute['name'] == 'location' and type_entity == 'plots':
                data_in_dict['location'].append(json.dumps(static_attribute['value']))
            elif static_attribute['name'] == 'description' and type_entity == 'plots':
                data_in_dict['description'].append(json.dumps(static_attribute['value']))
            else:
                data_in_dict[static_attribute['name']].append(static_attribute['value'])

    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)

    dataframe = pd.DataFrame(data=data_in_dict)
    dataframe.to_csv(output_dir / 'static_{}-{}.csv'.format(type_entity, datetime.now().strftime('%d-%m-%Y_%H:%M:%S')),
                     index=False, encoding='utf-8')

    dataframe = None
    data_in_dict = None

    gc.collect()


def generate_simulations(data, from_timestamp, to_timestamp, frequency, chunk_size=None, name='historic'):

    parameters = generate_parameters_with_interpolators(data['exports'])
    date_range = pd.date_range(from_timestamp, to_timestamp, freq=frequency)

    entities_to_active = dict()

    data_in_dict = collections.defaultdict(list)

    for entity in tqdm(data['entities'], desc='Generating entities and timestamp'):
        entities_to_active[entity['entity_name']] = entity['active']

        for date in date_range:
            data_in_dict['id_entity'].append(entity['entity_name'])
            data_in_dict['timestamp'].append(date)

    dataframe = pd.DataFrame(data=data_in_dict)

    data_in_dict = None
    gc.collect()

    cpu_number = multiprocessing.cpu_count() - 1
    pool = multiprocessing.Pool(processes=cpu_number)

    if not chunk_size:
        chunks = range(0, len(dataframe), (len(dataframe)//cpu_number)+1)
    else:
        chunks = range(0, len(dataframe), chunk_size)

    results = list()
    for index in range(len(chunks)):
        if not index == len(chunks) - 1:
            result = pool.apply_async(calculate_simulation_in_multiprocess, (dataframe[chunks[index]:chunks[index+1]-1], entities_to_active, parameters, name, index))
        else:
            result = pool.apply_async(calculate_simulation_in_multiprocess,
                             (dataframe[chunks[index]:], entities_to_active, parameters, name, index))
        results.append(result)


    dataframe = None
    gc.collect()

    pool.close()
    pool.join()

    output = [result.get() for result in results]


def generate_future_simulations(data, from_timestamp, to_timestamp, frequency, chunk_size=None):

    date_format = '%d/%m/%Y %H:%M'

    future_to_timestamp = datetime.strptime(to_timestamp, date_format)
    future_to_timestamp = future_to_timestamp + timedelta(days=14)

    if not chunk_size:
        generate_simulations(data, from_timestamp, future_to_timestamp.strftime(date_format), frequency, 2000000, name='future')
    else:
        generate_simulations(data, from_timestamp, future_to_timestamp.strftime(date_format), frequency, chunk_size*0.75, name='future')


def calculate_simulation_in_multiprocess(dataframe, entities_to_active, parameters, name, index):
    tqdm.pandas(desc='Apply progress')
    dataframe[['pressure', 'flow']] = dataframe.progress_apply(
        lambda row: calculate_pressure_flow(row, entities_to_active, parameters), axis=1)

    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)

    dataframe.to_csv(output_dir / 'simulations_{}_{}_{}.csv'.format(name, index, datetime.now().strftime('%d-%m-%Y_%H:%M:%S')),
                     index=False, encoding='utf-8')

    dataframe = None
    gc.collect()


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

    parser = argparse.ArgumentParser()

    parser.add_argument('simulation_file', help='File to simulate')
    parser.add_argument('from_date', help='Date which starting to simulate. Format: %d/%m/%Y %H:%M')
    parser.add_argument('to_date', help='Date which starting to simulate. Format: %d/%m/%Y %H:%M')
    parser.add_argument('frequency', help='Frequency between dates, in pandas format (eg: 15T)')
    parser.add_argument('--chunk', type=int, help='Chunk size')
    parser.add_argument('--plot', help='File to generate the plot statics')

    args = parser.parse_args()

    with open(args.simulation_file) as simulation_file:
        data_json = json.load(simulation_file)

        generate_static(data_json, 'entities')

        if args.chunk:
            generate_simulations(data_json, args.from_date, args.to_date, args.frequency, args.chunk)
            generate_future_simulations(data_json, args.from_date, args.to_date, args.frequency, args.chunk)
        else:
            generate_simulations(data_json, args.from_date, args.to_date, args.frequency)
            generate_future_simulations(data_json, args.from_date, args.to_date, args.frequency, args.chunk)

    if args.plot:
        with open(args.plot) as plot_file:
            plot_json = json.load(plot_file)

            generate_static(plot_json, 'plots')
