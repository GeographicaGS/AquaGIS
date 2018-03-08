
App.View.Map.Layer.Aq_cons.SectorSavingLayer = Backbone.View.extend({
  iconsFolder: '/verticals/aquagis-theme/img/icons/map',

  initialize: function(options, payload, map) {
    this._payload = payload;

    // Modelos
    let sector = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cons.sector'});
    let sensor = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cata.sensor'});
    
    sensor.parse = function(e) {
      _.each(e.features, function(f,i) {
        f.properties.index = i;
      });
      return e;
    }

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
          'id': 'sector_line',
          'type': 'line',
          'source': 'aqua_sectors',
          'layout': {},
          'paint': {
            'line-color': '#165288',
            'line-width': 1.5,
          }
        }
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
        'paint': {
          'circle-radius': 20,
          'circle-color': '#8672D2',
          'circle-opacity': 0.5
        },
        'filter': ['==','index',0]
      },{
        'id': 'sensors_symbol',
        'type': 'symbol',
        'source': 'sensors_datasource',
        'layout': {
          'icon-image': 'sensor-agua',
          'icon-allow-overlap': true,
          'icon-size': 0.8,
        }
      }],
      map: map
    })
    .setHoverable(true)
    .on('click','sensors_symbol',function(e) {
      map.mapChanges.set('clickedSector', e.features[0]);
      map._map.setFilter("sensors_circle", ["==", "index",e.features[0].properties.index]);
    });

  },

  onClose: function() {
  }
});