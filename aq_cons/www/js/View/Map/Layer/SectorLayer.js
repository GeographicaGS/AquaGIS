'use strict';

App.View.Map.Layer.SectorLayer = App.View.Map.Layer.MapboxGLLayer.extend({


  initialize: function(model, body, map) {
    App.View.Map.Layer.MapboxGLLayer.prototype.initialize.call(this, model, body, map);
    this._idSource = 'aqua_sectors';
    this._ids = ['sector'];
    
  },

  _success: function(change) {
    let data = change.changed;
    this._map.addSource(this._idSource, {
      'type': 'geojson',
      'data': data,
    });
    App.View.Map.Layer.MapboxGLLayer.prototype._success.call(this, change);    
  },

  _layersConfig: function() {
    return this.layers = [{
      'id': 'urban-areas-fill',
      'type': 'fill',
      'source': this._idSource,
      'layout': {},
      'paint': {
          'fill-color': '#f08',
          'fill-opacity': 0.4
      }
    }];
  }
});
