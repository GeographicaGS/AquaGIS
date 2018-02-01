import os

input_dir = './output/'
output_dir = './'

files = {
    'static_plots': 'plots_catalog.csv',
    'static_entities': 'constructions_catalog.csv',
    'simulations_historic': 'constructions.csv',
    'simulations_future': 'constructions_future.csv'
}

columns = {
    'completePlot': 'complete_plot',
    'location': 'position',
    'refSector': 'refsector',
    'refPlot': 'refplot',
    'timestamp': 'TimeInstant'
}

for k, v in files.items():
    print('{0} ({1}) batch'.format(k, v))
    
    first_file = True
    k_files = map(lambda x: os.path.join(input_dir, x), filter(lambda x: x.startswith(k), os.listdir(input_dir)))
    
    with open(os.path.join(output_dir, v), 'w') as output_file:
        for k_file in k_files:
            
            first_line = True
            print('\t reading {0}'.format(k_file))
            
            with open(k_file) as input_file:
                first_line = True
                
                for line in input_file:                    
                    if first_file or (not first_file and not first_line):
                        if first_line:
                            for k_column, v_column in columns.items():
                                line = line.replace(k_column, v_column)
                        output_file.write(line)
                        
                    first_line = False
                    
            first_file = False
              
print('Finished')
