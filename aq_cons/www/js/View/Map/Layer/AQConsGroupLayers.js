
App.View.Map.Layer.Aq_cons.GroupLayer = Backbone.View.extend({
  iconsFolder: '/verticals/aquasig-theme/img/icons/map',

  initialize: function(options, payload, map) {
    this._payload = payload;

    // Modelos
    let sensor = new App.Model.Aq_cons.Model({scope: options.scope, type: 'now', entity: 'aq_cons.sensor'});
    let sector = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cons.sector'});
    let tank = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cata.tank'});
    let connection = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cata.connections_point'});
    let supplyLine = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cata.supply_line'});
    let hydrant = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cata.hydrant_point'});
    let hydrantLine = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cata.hydrant_line'});
    let valve = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cata.valve_point'});
    let valveLine = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cata.valve_line'});
    let well = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cata.well_point'});
    let wellLine = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cata.well_line'});
    let plot = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cons.plot'});

    sector.parse = function(e) {
      e.features = _.map(e.features, function(feature) {
        let diffDates = App.ctx.get('finish').diff(App.ctx.get('start'), 'days') + 1;
        let sectorPayload = JSON.parse(this.payload.data).var;

        feature.properties[sectorPayload + '.total'] = feature.properties[sectorPayload];
        if (feature.properties[sectorPayload] !== null) {
          feature.properties[sectorPayload] /= diffDates;
        }

        return feature;
      }.bind(this));
      return e;
    };

    plot.parse = function(e) {
      e.features = _.map(e.features, function(feature) {
        let payload = JSON.parse(this.payload.data).var;
        let plotPayload = payload.replace(/(.*\.).*(\..*)/,'$1plot$2');
        let diffDates = App.ctx.get('finish').diff(App.ctx.get('start'), 'days') + 1;
        feature.properties['height'] = feature.properties['floors'] * 4;
        feature.properties[plotPayload + '.total'] = feature.properties[plotPayload];
        if (feature.properties[plotPayload] !== null) {
          feature.properties[plotPayload] /= diffDates;
        }

        return feature;
      }.bind(this));
      return e;
    };

    // Layers
    // SECTOR
    this._sectorLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
      source: {
        id: 'aqua_sectors',
        model: sector,
        payload: this._payload,
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
        'maxzoom': 14,
        'paint': {
          'fill-color': {
            'property': 'aq_cons.sector.forecast',
            'type': 'exponential',
            'default': 'transparent',
            'stops': [
              [0, 'transparent'],
              [0.0000001, '#64B6D9'],
              [100, '#4CA7D7'],
              [400, '#3397D5'],
              [1000, '#1A88D3'],
              [2000, '#0278D1']
            ]
          },
          'fill-opacity': 0.7
        }
      },
      {
        'id': 'sector_line',
        'type': 'line',
        'source': 'aqua_sectors',
        'layout': {},
        'paint': {
          'line-color': '#165288',
          'line-width': 1,
          'line-dasharray': [1,2]
        }
      }
    ],
      map: map
    })
    .setHoverable(true)
    .setInteractivity(__('Sector'),[{
        feature: 'name',
        label: 'Nombre',
        units: ''
      }, {
        feature: 'aq_cons.sector.forecast.total?',
        label: 'Consumo total',
        units: 'm³',
        nbf: App.nbf
      }, {
        feature: 'aq_cons.sector.consumption.total?',
        label: 'Consumo total',
        units: 'm³',
        nbf: App.nbf
      }, {
        feature: 'aq_cons.sector.forecast?',
        label: 'Consumo diario',
        units: 'm³',
        nbf: App.nbf
      }, {
        feature: 'aq_cons.sector.consumption?',
        label: 'Consumo diario',
        units: 'm³',
        nbf: App.nbf
      }]);

    let plotPayload = JSON.parse(JSON.stringify(this._payload));
    plotPayload.var = plotPayload.var.replace(/(.*\.).*(\..*)/,'$1plot$2');

    this._plotLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
      source: {
        id: 'aqua_plots',
        model: plot,
        payload: plotPayload
      },
      legend: {
        sectionId: 'plot',
        sectionIcon: this.iconsFolder + '/edificio.svg',
        sectionName: __('Edificios'),
        name: __('Edificios')
      },
      layers:[{
        'id': 'plot',
        'type': 'fill',
        'source': 'aqua_plots',
        'layout': {},
        'minzoom': 14,
        'paint': {
          'fill-color': {
            'property': 'aq_cons.plot.forecast',
            'type': 'interval',
            'default': 'transparent',
            'stops': [
              [0, 'transparent'],
              [0.0000001, '#64B6D9'],
              [1, '#4CA7D7'],
              [2, '#3397D5'],
              [4, '#1A88D3'],
              [10, '#0278D1']
            ]
          },
          'fill-opacity': 0.7,
        }
      }, {
        'id': 'plot_line',
        'type': 'line',
        'source': 'aqua_plots',
        'layout': {},
        'minzoom': 14,
        'paint': {
          'line-color': '#165288',
          'line-width': 1
        }
      }, {
        'id': 'plot_buildings',
        'type': 'fill-extrusion',
        'source': 'aqua_plots',
        'minzoom': 14,
        'layout': {
          'visibility': 'none'
        },
        'paint': {
          'fill-extrusion-height': {
            'property': 'height',
            'type': 'identity'
          },
          'fill-extrusion-color': {
            'property': 'aq_cons.plot.forecast',
            'type': 'interval',
            'default': 'transparent',
            'stops': [
              [0, 'transparent'],
              [0.0000001, '#64B6D9'],
              [1, '#4CA7D7'],
              [2, '#3397D5'],
              [4, '#1A88D3'],
              [10, '#0278D1']
            ]
          },
          'fill-extrusion-opacity': 0.8,
        }
      }
    ],
      map: map
    })
    .setHoverable(true)
    .setInteractivity(__('Parcela'), function(e, popup, _this) {
      let prop = [{
        feature: 'description#RegistryRef',
        label: 'Identificador catastral',
        units: ''
      },{
        feature: 'aq_cons.plot.forecast.total?',
        label: 'Consumo total',
        units: 'm³',
        nbf: App.nbf
      }, {
        feature: 'aq_cons.plot.consumption.total?',
        label: 'Consumo total',
        units: 'm³',
        nbf: App.nbf
      },{
        feature: 'aq_cons.plot.forecast?',
        label: 'Consumo diario',
        units: 'm³',
        nbf: App.nbf
      }, {
        feature: 'aq_cons.plot.consumption?',
        label: 'Consumo diario',
        units: 'm³',
        nbf: App.nbf
      }, {
        feature: 'area',
        label: 'Área',
        units: 'm2'
      }, {
        feature: 'floors',
        label: 'Plantas',
        units: ''
      }];

      new App.Collection.Aq_cons.PlotsModel({
        scope: options.scope,
        entity: e.features[0].properties['id_entity']
      }).fetch({success: function(response) {
        let constructions = response.toJSON();
        e.features[0].properties['n_const'] = constructions.length;
        let arr = [];
        _.each(constructions, function(c) {
          if (!arr.includes(c.usage)) {
            arr.push(__(c.usage))
          }
        });
        e.features[0].properties['type_const'] = arr.join(",");
        prop.push({
          feature: 'type_const',
          label: 'Tipos de construcciones',
          units: ''
        });
        prop.push({
          feature: 'n_const',
          label: 'Número de construcciones',
          units: ''
        });
        let html = _this.bindData(__('Parcela'),prop,e);
        popup.setHTML(html);
      }})
    });

    this._supplyLineLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
      source: {
        id: 'supply_line_datasource',
        model: supplyLine,
        payload: this._payload
      },
      legend: {
        sectionId: 'supply',
        sectionIcon: this.iconsFolder + '/red.svg',
        sectionName: __('Red de abastecimiento'),
        name: __('Red de abastecimiento')
      },
      layers:[{
        'id': 'supply_line',
        'type': 'line',
        'source': 'supply_line_datasource',
        'minzoom': 14,
        'paint': {
          'line-width': 1,
          'line-color': '#86E9A7',
        }
      },
      {
        'id': 'supply_line2',
        'type': 'line',
        'source': 'supply_line_datasource',
        'minzoom': 16,
        'paint': {
          'line-width': 2,
          'line-color': '#86E9A7',
        }
      }],
      map: map
    });

    this._wellLineLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
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
      map: map
    });

    this._hydrantLineLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
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
      map: map
    });

    this._valveLineLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
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
      map: map
    });

    this._connectionLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
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
      layers:[
      {
        'id': 'connections_circle',
        'type': 'circle',
        'source': 'connections_datasource',
        'minzoom': 15,
        'maxzoom': 17,
        'paint': {
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#FFF',
          'circle-color': '#3561BA',
        }
      },
       {
        'id': 'connections_symbol',
        'type': 'symbol',
        'source': 'connections_datasource',
        'minzoom': 17,
        'layout': {

          'icon-image': 'acometida',
          'icon-allow-overlap': true
        }
      }],
      map: map
    })
    .setHoverable(true)
    .setInteractivity(__('Acometida'));

    this._hydrantLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
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
      layers:[
      {
        'id': 'hydrants_circle',
        'type': 'circle',
        'source': 'hydrants_datasource',
        'minzoom': 15,
        'maxzoom': 17,
        'paint': {
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#FFF',
          'circle-color': '#E87668',
        }
      },
      {
        'id': 'hydrants_symbol',
        'type': 'symbol',
        'source': 'hydrants_datasource',
        'minzoom': 17,
        'layout': {

          'icon-image': 'hidrante',
          'icon-allow-overlap': true
        }
      }],
      map: map
    })
    .setHoverable(true)
    .setInteractivity(__('Hidrante'));

    this._valveLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
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
      layers:[
      {
        'id': 'valves_circle',
        'type': 'circle',
        'source': 'valves_datasource',
        'minzoom': 15,
        'maxzoom': 17,
        'paint': {
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#FFF',
          'circle-color': '#68BC84',
        }
      },
       {
        'id': 'valves_symbol',
        'type': 'symbol',
        'source': 'valves_datasource',
        'minzoom': 17,
        'layout': {

          'icon-image': 'valvula',
          'icon-allow-overlap': true
        }
      }],
      map: map
    })
    .setHoverable(true)
    .setInteractivity(__('Válvula'));

    this._wellLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
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
      layers:[
      {
        'id': 'wells_circle',
        'type': 'circle',
        'source': 'wells_datasource',
        'minzoom': 15,
        'maxzoom': 17,
        'paint': {
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#FFF',
          'circle-color': '#0F82E0',
        }
      },
      {
        'id': 'wells_symbol',
        'type': 'symbol',
        'source': 'wells_datasource',
        'minzoom': 17,
        'layout': {

          'icon-image': 'pozo',
          'icon-allow-overlap': true
        }
      }],
      map: map
    })
    .setHoverable(true)
    .setInteractivity(__('Pozo'));

    this._sensorLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
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
        'paint': {
          'circle-radius': 4,
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

          'icon-image': 'sensor-agua',
          'icon-allow-overlap': true
        }
      }],
      map: map
    })
    .setHoverable(true)
    .setInteractivity(__('Sensor'),[{
      feature: 'name',
      label: 'Nombre',
      units: ''
    }, {
      feature: 'dissolved_oxygen',
      label: __('Oxígeno disuelto'),
      units: 'mg/L³',
      nbf: App.nbf
    }, {
      feature: 'electric_conductivity',
      label: __('Conductividad eléctrica'),
      units: 'μS/cm',
      nbf: App.nbf
    }, {
      feature: 'ph',
      label: 'PH',
      units: '',
      nbf: App.nbf
    }, {
      feature: 'temperature',
      label: __('Temperatura'),
      units: '℃',
      nbf: App.nbf
    }],
    '/' + App.currentScope + '/aq_cons.sensor/{{device}}/lastdata');

    this._tankLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
      source: {
        id: 'tanks_datasource',
        model: tank,
        payload: this._payload,
        data: App.ctx.getMapSourceData({
          id: 'tanks_datasource',
          scope: options.scope
        })
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
          'circle-radius': 4,
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
          'icon-image': 'deposito-saving',
          'icon-allow-overlap': true
        }
      }],
      map: map
    })
    .setHoverable(true)
    .setInteractivity(__('Depósito'),[{
      feature:'tank',
      label: 'Referencia',
      units: ''
    },{
      feature:'capacity',
      label: 'Capacidad',
      units: 'l'
    },{
      feature:'status',
      label: 'Estado',
      units: ''
    },{
      feature:'location',
      label: 'Ubicación',
      units: ''
    }]);

    map._map.moveLayer('plot_buildings');
  },

  onClose: function() {
    this._sectorLayer.close();
    this._plotLayer.close();
    this._supplyLineLayer.close();
    this._wellLineLayer.close();
    this._hydrantLineLayer.close();
    this._valveLineLayer.close();
    this._connectionLayer.close();
    this._hydrantLayer.close();
    this._valveLayer.close();
    this._wellLayer.close();
    this._sensorLayer.close();
    this._tankLayer.close();
  },

  updatePayload: function(payload) {
    this._payload = payload;
    let plotPayload = JSON.parse(JSON.stringify(payload));
    plotPayload.var = plotPayload.var.replace(/(.*\.).*(\..*)/,'$1plot$2');

    this._sectorLayer.updateData(payload);
    this._sectorLayer.updatePaintOptions(payload.var);

    this._plotLayer.updateData(plotPayload);
    this._plotLayer.updatePaintOptions(plotPayload.var);
    this._plotLayer.layers[2].paint['fill-extrusion-color']['property'] = plotPayload.var;
    this._plotLayer._map._map
      .setPaintProperty('plot_buildings', 'fill-extrusion-color', this._plotLayer.layers[2].paint['fill-extrusion-color']);


    this._supplyLineLayer.updateData(payload);
    this._wellLineLayer.updateData(payload);
    this._hydrantLineLayer.updateData(payload);
    this._valveLineLayer.updateData(payload);
    this._connectionLayer.updateData(payload);
    this._hydrantLayer.updateData(payload);
    this._valveLayer.updateData(payload);
    this._wellLayer.updateData(payload);
    this._sensorLayer.updateData(payload);
    this._tankLayer.updateData(payload);
  }
});
