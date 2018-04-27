
App.View.Map.Layer.Aq_cons.SectorSavingLayer = Backbone.View.extend({
  iconsFolder: '/verticals/aquasig-theme/img/icons/map',

  initialize: function(options, payload, map) {
    this._payload = payload;

    // Modelos
    let sector = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cons.sector'});
    let tank = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cons.tank'});
    
    tank.parse = function(e) {
      _.each(e.features, function(f,i) {
        f.properties.index = i;
        f.properties.status = f.properties.level < f.properties.min_level ? 'emergency' : 'saving';
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
    this._tanksLayer = new App.View.Map.Layer.Aq_cons.GeoJSONLayer({
      source: {
        id: 'tanks_datasource',
        model: tank,
        payload: this._payload
      },
      layers:[{
        'id': 'sensors_circle',
        'type': 'circle',
        'source': 'tanks_datasource',
        'paint': {
          'circle-radius': 20,
          'circle-color': '#68BEE2',
          'circle-opacity': 0.5
        },
        'filter': ['==','index',0]
      },{
        'id': 'sensors_symbol',
        'type': 'symbol',
        'source': 'tanks_datasource',
        'layout': {
          'icon-image': 'deposito-{status}',
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
  },

  updatePayload: function(payload) {
    this._payload = payload;
    let plotPayload = JSON.parse(JSON.stringify(payload));
    plotPayload.var = plotPayload.var.replace(/(.*\.).*(\..*)/,'$1plot$2');

    this._sectorLayer.updateData(payload);
    this._tanksLayer.updateData(payload);
  }
});
