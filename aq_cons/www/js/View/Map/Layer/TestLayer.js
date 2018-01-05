'use strict';

App.View.Map.Layer.TestLayer = Backbone.View.extend({

  _map: null,
  _ids: [],
  _idSource: '',
  layers: [],

  initialize: function(source) {
    // source será una collection. En initialize se hará la petición y se actualizarán los datos
    this.layers = [{
      'id': 'urban-areas-fill',
      'type': 'fill',
      'source': {
          'type': 'geojson',
          'data': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_urban_areas.geojson'
      },
      'layout': {},
      'paint': {
          'fill-color': '#f08',
          'fill-opacity': 0.4
      }
    }]
  },
});
