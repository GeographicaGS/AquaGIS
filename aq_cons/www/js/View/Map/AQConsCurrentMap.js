'use strict';

App.View.Panels.Aq_cons.CurrentMap = App.View.Map.MapboxView.extend({

  _payload: {
    filters: {
      condition: {}
    }
  },

  iconsFolder: '/verticals/aquagis-theme/img/icons/map',
  
  initialize: function (options) {
    options = _.defaults(options, {
      defaultBasemap: 'positron',
      sprites: '/verticals/aquagis-theme/mapstyle/sprite',      
      center: [-6.0738382, 37.3357641]
    });
    App.View.Map.MapboxView.prototype.initialize.call(this, options);
  },

  _onMapLoaded: function() {
    // Modelos
    let sensor = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.sensor'});
    let sector = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cons.sector'});
    let tank = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.tank'});
    let connection = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.connections_point'});
    let connectionLine = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.connections_line'});
    let supply = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.supply_point'});
    let supplyLine = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.supply_line'});
    let hydrant = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.hydrant_point'});
    let hydrantLine = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.hydrant_line'});
    let valve = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.valve_point'});
    let valveLine = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.valve_line'});
    let well = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.well_point'});
    let wellLine = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.well_line'});
    let plot = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.plot'});
    let plotStructure = new App.Model.Aq_cons.Model({scope: this._options.scope, entity: 'aq_cata.plot_structure'});


    // Layers

    // SECTOR
    this._sectorLayer = new App.View.Map.Layer.Aq_cons.GenericLayer({
      source: {
        id: 'aqua_sectors',
        model: sector,
        payload: this._payload
      },
      legend: {
        sectionId: 'sector',
        sectionIcon: this.iconsFolder + '/sectores.svg',
        sectionName: __('Sectores'),
        name: __('Sectores')
      },
      layers:[{
        'id': 'sector',
        'type': 'fill',
        'source': 'aqua_sectors',
        'layout': {},
        'paint': {
            'fill-color': '#A8D5FF',
            'fill-opacity': 0.4
        }
      }],
      map: this
    });

    this._plotLayer = new App.View.Map.Layer.Aq_cons.GenericLayer({
      source: {
        id: 'aqua_plots',
        model: plot,
        payload: this._payload
      },
      layers:[{
        'id': 'plot',
        'type': 'fill',
        'source': 'aqua_plots',
        'layout': {},
        'minzoom': 16,
        'paint': {
            'fill-color': '#165288',
            'fill-opacity': 0.4
        }
      }],
      map: this
    });

    this._supplyLineLayer = new App.View.Map.Layer.Aq_cons.GenericLayer({
      source: {
        id: 'supply_line_datasource',
        model: supplyLine,
        payload: this._payload
      },
      legend: {
        sectionId: 'supply',
        sectionIcon: this.iconsFolder + '/abastecimiento.svg',
        sectionName: __('Red de abastecimiento'),
        name: __('Red de abastecimiento')
      },
      layers:[{
        'id': 'supply_line',
        'type': 'line',
        'source': 'supply_line_datasource',
        'paint': {
          'line-color': '#45AAB0',
        }
      }],
      map: this
    });

    this._wellLineLayer = new App.View.Map.Layer.Aq_cons.GenericLayer({
      source: {
        id: 'well_line_datasource',
        model: wellLine,
        payload: this._payload
      },
      legend: {
        sectionId: 'wells',
        sectionIcon: this.iconsFolder + '/pozo.svg',
        sectionName: __('Pozos'),
        name: __('Red')
      },
      layers:[{
        'id': 'well_line',
        'type': 'line',
        'source': 'well_line_datasource',
        'paint': {
          'line-color': '#0F82E0',
        }
      }],
      map: this
    });

    this._hydrantLineLayer = new App.View.Map.Layer.Aq_cons.GenericLayer({
      source: {
        id: 'hydrant_line_datasource',
        model: hydrantLine,
        payload: this._payload
      },
      legend: {
        sectionId: 'hydrants',
        sectionIcon: this.iconsFolder + '/hidrante.svg',
        sectionName: __('Hidrantes'),
        name: __('Red')
      },
      layers:[{
        'id': 'hydrant_line',
        'type': 'line',
        'source': 'hydrant_line_datasource',
        'paint': {
          'line-color': '#6D83E9',
        }
      }],
      map: this
    });

    this._valveLineLayer = new App.View.Map.Layer.Aq_cons.GenericLayer({
      source: {
        id: 'valve_line_datasource',
        model: valveLine,
        payload: this._payload
      },
      legend: {
        sectionId: 'valves',
        sectionIcon: this.iconsFolder + '/valvula.svg',
        sectionName: __('Válvulas'),
        name: __('Red')
      },
      layers:[{
        'id': 'valve_line',
        'type': 'line',
        'source': 'valve_line_datasource',
        'paint': {
          'line-color': '#68BC84',
        }
      }],
      map: this
    });

    this._connectionLayer = new App.View.Map.Layer.Aq_cons.GenericLayer({
      source: {
        id: 'connections_datasource',
        model: connection,
        payload: this._payload
      },
      legend: {
        sectionId: 'connections',
        sectionIcon: this.iconsFolder + '/acometida.svg',
        sectionName: __('Acometidas'),
        name: __('Acometidas')
      },
      layers:[{
        'id': 'connections_circle',
        'type': 'circle',
        'source': 'connections_datasource',
        'minzoom': 14,
        'maxzoom': 16,
        'paint': {
          'circle-radius': 2,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#DDDDDF',
          'circle-color': '#3561BA',
        }
      }, {
        'id': 'connections_symbol',
        'type': 'symbol',
        'source': 'connections_datasource',
        'minzoom': 16,
        'layout': {
          'icon-size': 1.5,
          'icon-image': 'acometida',
          'icon-allow-overlap': true
        }
      }],
      map: this
    });

    this._hydrantLayer = new App.View.Map.Layer.Aq_cons.GenericLayer({
      source: {
        id: 'hydrants_datasource',
        model: hydrant,
        payload: this._payload
      },
      legend: {
        sectionId: 'hydrants',
        sectionIcon: this.iconsFolder + '/hidrante.svg',
        sectionName: __('Hidrantes'),
        name: __('Hidrantes')
      },
      layers:[{
        'id': 'hydrants_circle',
        'type': 'circle',
        'source': 'hydrants_datasource',
        'minzoom': 14,
        'maxzoom': 16,
        'paint': {
          'circle-radius': 2,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#DDDDDF',
          'circle-color': '#6D83E9',
        }
      }, {
        'id': 'hydrants_symbol',
        'type': 'symbol',
        'source': 'hydrants_datasource',
        'minzoom': 16,
        'layout': {
          'icon-size': 1.5,
          'icon-image': 'hidrante',
          'icon-allow-overlap': true
        }
      }],
      map: this
    });

    this._valveLayer = new App.View.Map.Layer.Aq_cons.GenericLayer({
      source: {
        id: 'valves_datasource',
        model: valve,
        payload: this._payload
      },
      legend: {
        sectionId: 'valves',
        sectionIcon: this.iconsFolder + '/valvula.svg',
        sectionName: __('Válvulas'),
        name: __('Válvulas')
      },
      layers:[{
        'id': 'valves_circle',
        'type': 'circle',
        'source': 'valves_datasource',
        'minzoom': 14,
        'maxzoom': 16,
        'paint': {
          'circle-radius': 2,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#DDDDDF',
          'circle-color': '#68BC84',
        }
      }, {
        'id': 'valves_symbol',
        'type': 'symbol',
        'source': 'valves_datasource',
        'minzoom': 16,
        'layout': {
          'icon-size': 1.5,
          'icon-image': 'valvula',
          'icon-allow-overlap': true
        }
      }],
      map: this
    });

    this._wellLayer = new App.View.Map.Layer.Aq_cons.GenericLayer({
      source: {
        id: 'wells_datasource',
        model: well,
        payload: this._payload
      },
      legend: {
        sectionId: 'wells',
        sectionIcon: this.iconsFolder + '/pozo.svg',
        sectionName: __('Pozos'),
        name: __('Pozos')
      },
      layers:[{
        'id': 'wells_circle',
        'type': 'circle',
        'source': 'wells_datasource',
        'minzoom': 14,
        'maxzoom': 16,
        'paint': {
          'circle-radius': 2,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#DDDDDF',
          'circle-color': '#0F82E0',
        }
      }, {
        'id': 'wells_symbol',
        'type': 'symbol',
        'source': 'wells_datasource',
        'minzoom': 16,
        'layout': {
          'icon-size': 1.5,
          'icon-image': 'pozo',
          'icon-allow-overlap': true
        }
      }],
      map: this
    });

    this._sensorLayer = new App.View.Map.Layer.Aq_cons.GenericLayer({
      source: {
        id: 'sensors_datasource',
        model: sensor,
        payload: this._payload
      },
      legend: {
        sectionId: 'sensor',
        sectionIcon: this.iconsFolder + '/sensor-agua.svg',
        sectionName: __('Sensores'),
        name: __('Sensores')
      },
      layers:[{
        'id': 'sensors_circle',
        'type': 'circle',
        'source': 'sensors_datasource',
        'maxzoom': 16,
        'paint': {
          'circle-radius': 2,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#DDDDDF',
          'circle-color': '#8672D2',
        }
      }, {
        'id': 'sensors_symbol',
        'type': 'symbol',
        'source': 'sensors_datasource',
        'minzoom': 16,
        'layout': {
          'icon-size': 1.5,
          'icon-image': 'sensor-agua',
          'icon-allow-overlap': true
        }
      }],
      map: this
    });

    this._tankLayer = new App.View.Map.Layer.Aq_cons.GenericLayer({
      source: {
        id: 'tanks_datasource',
        model: tank,
        payload: this._payload
      },
      legend: {
        sectionId: 'tanks',
        sectionIcon: this.iconsFolder + '/deposito.svg',
        sectionName: __('Depósitos'),
        name: __('Depósitos')
      },
      layers:[{
        'id': 'tanks_circle',
        'type': 'circle',
        'source': 'tanks_datasource',
        'maxzoom': 16,
        'paint': {
          'circle-radius': 2,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#DDDDDF',
          'circle-color': '#68BEE2',
        }
      }, {
        'id': 'tanks_symbol',
        'type': 'symbol',
        'source': 'tanks_datasource',
        'minzoom': 16,
        'layout': {
          'icon-size': 1.5,
          'icon-image': 'deposito',
          'icon-allow-overlap': true
        }
      }],
      map: this
    });

    this.drawLegend();
  },

  

  _onBBoxChange: function(bbox) {
    console.log(bbox);
  },
});
