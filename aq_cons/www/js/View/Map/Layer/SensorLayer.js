'use strict';

App.View.Map.Layer.SensorLayer = App.View.Map.Layer.MapboxGLLayer.extend({


  initialize: function(model, body, map) {
    this._idSource = 'sensors_datasource';
    this._ids = ['sensors_circle', 'sensors_symbol'];
    App.View.Map.Layer.MapboxGLLayer.prototype.initialize.call(this, model, body, map);
  },

  _success: function(change) {
    App.View.Map.Layer.MapboxGLLayer.prototype._success.call(this, change);  
  },

  _layersConfig: function() {
    return this.layers = [{
      'id': this._ids[0],
      'type': 'circle',
      'source': this._idSource,
      'maxzoom': 15,
      'paint': {
        'circle-radius': 4,
        'circle-color': '#8672D2',
      }
    }, {
      'id': this._ids[1],
      'type': 'symbol',
      'source': this._idSource,
      'minzoom': 15,
      'layout': {
        'icon-size': 1.5,
        'icon-image': 'sensor-agua',
        'icon-allow-overlap': true
      }
    }];
  }
});
