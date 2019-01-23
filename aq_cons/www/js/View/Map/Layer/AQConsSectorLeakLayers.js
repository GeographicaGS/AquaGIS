
App.View.Map.Layer.Aq_cons.SectorLeakLayer = Backbone.View.extend({
  iconsFolder: '/verticals/aquasig-theme/img/icons/map',

  initialize: function(options, payload, map) {
    this._payload = payload;

    // Modelos
    let sector = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cons.sector'});
    let plot = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cons.plot'});
    let sensor = new App.Model.Aq_cons.Model({scope: options.scope, type: 'now', entity: 'aq_cons.sensor'});
    let sectorCentroid = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cons.sector'});

    plot.parse = function(e) {
      // Calculated height as 4 meters per floor
      e.features = _.map(e.features, function(feature) {
        feature.properties['height'] = feature.properties['floors'] * 4;
        return feature;
      });
      return e;
    };

    sectorCentroid.parse = function(e) {
      return turf.featureCollection(_.map(e.features, function(polygon) {
        let point = turf.centroid(polygon);
        point.properties.name = polygon.properties.name;
        return point;
      }))
    };

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
      layers:[
        {
          'id': 'sector',
          'type': 'fill',
          'source': 'aqua_sectors',
          'layout': {},
          'paint': {
            'fill-color': {
              'property': 'leak_status',
              'type': 'categorical',
              'stops': [
                [0, '#7ED321'],
                [1, '#F8CA1C'],
                [2, '#E15757']
              ]
            },
            'fill-opacity': 0.2,
          },
        },
        {
          "id": "sector_selected",
          "type": "fill",
          "source": "aqua_sectors",
          "layout": {},
          'paint': {
            'fill-color': {
              'property': 'leak_status',
              'type': 'categorical',
              'stops': [
                [0, '#7ED321'],
                [1, '#F8CA1C'],
                [2, '#E15757']
              ]
            },
            "fill-opacity": 0.55
          },
          'filter': ['all']          
        },
        {
          'id': 'sector_line',
          'type': 'line',
          'source': 'aqua_sectors',
          'layout': {},
          'paint': {
            'line-color': '#165288',
            'line-width': 1,
            'line-opacity': 0.8,
            'line-dasharray': [1,2]
          }
        },
        {
          "id": "sector_line_selected",
          "type": "line",
          "source": "aqua_sectors",
          "layout": {},
          'paint': {
            'line-color': '#165288',
            'line-opacity': 0.9,
            'line-width': 2,
          },
          'filter': ["==", "id_entity",'']
        },
      ],
      map: map
    })
    .setHoverable(true)
    .on('click','sector',function(e) {
      map.mapChanges.set('clickedSector',e);
    });
    
    // Sensor
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
        'maxzoom': 16,
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
    });

    this._sectorLayerLabels = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
      source: {
        id: 'aqua_sectors_centroid',
        model: sectorCentroid,
        payload: this._payload,
      },
      layers:[
        {
          'id': 'sector_name',
          'type': 'symbol',
          'source': 'aqua_sectors_centroid',
          'maxzoom': 15,
          'layout': {
            'symbol-placement': 'point',
            'text-size': 12,
            'text-field': {
              'property': 'name',
              'type': 'identity'
            },
          },
          'paint': {
            'text-color': '#165288',
            'text-halo-color': '#fff',
            'text-halo-width': 1,
          }
        },
      ],
      map: map
    });

    // PLOT
    this._plotLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
      source: {
        id: 'aqua_plots',
        model: plot,
        payload: {filters: {condition:{}}}
      },
      legend: {
        sectionId: 'plot',
        sectionIcon: this.iconsFolder + '/edificio.svg',
        sectionName: __('Edificios'),
        name: __('Edificios')
      },
      layers:[{
        'id': 'plot_line',
        'type': 'line',
        'source': 'aqua_plots',
        'layout': {},
        'minzoom': 15,
        'maxzoom': 17,
        'paint': {
          'line-color': '#0278D1',
          'line-width': 1
        }
      }, {
        'id': 'plot_line2',
        'type': 'line',
        'source': 'aqua_plots',
        'layout': {},
        'minzoom': 17,
        'paint': {
          'line-color': '#0278D1',
          'line-width': 2
        }
      }, {
        'id': 'plot_buildings',
        'type': 'fill-extrusion',
        'source': 'aqua_plots',
        'minzoom': 15,
        'layout': {
          'visibility': 'none'          
        },
        'paint': {
          'fill-extrusion-height': {
            'property': 'height',
            'type': 'identity'
          },
          'fill-extrusion-color': '#0278D1'
        }
      }
    ],
      map: map
    }),

    this.listenTo(map.mapChanges,'change:clickedSector',function(e) {
      if(e.get('clickedSector') === undefined) {
        map._map.fitBounds(turf.bbox(sector.changed));
        map._map.setFilter("sector_selected", ["all"]);
        map._map.setFilter("sector_line_selected", ["==", "id_entity",""]);
      }
    });
  },

  onClose: function() {
  }
});
