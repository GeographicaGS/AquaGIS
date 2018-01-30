
App.View.Map.Layer.Aq_cons.SectorLeakLayer = Backbone.View.extend({
  iconsFolder: '/verticals/aquagis-theme/img/icons/map',

  initialize: function(options, payload, map) {
    this._payload = payload;

    // Modelos
    let sector = new App.Model.Aq_cons.Model({scope: options.scope, type: options.type, entity: 'aq_cons.sector'});
    
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
          'maxzoom': 16,
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
            "fill-opacity": 0.5
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
            'line-width': 2,
            'line-dasharray': [2,2]
          }
        },
      ],
      map: map
    })
    .setHoverable(true)
    .on('click','sector',function(e) {
      let featureCollection = _.find(sector.changed.features, function(ft) {
        return ft.properties['id_entity'] === e.features[0].properties['id_entity'];
      });
      map._map.fitBounds(turf.bbox(featureCollection));
      map._map.setFilter("sector_selected", ["==", "id_entity", e.features[0].properties['id_entity']]);
    });
  },

  onClose: function() {
  }
});
