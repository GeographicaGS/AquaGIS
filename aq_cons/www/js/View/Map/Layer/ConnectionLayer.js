'use strict';

App.View.Map.Layer.ConnectionLayer = App.View.Map.Layer.MapboxGLLayer.extend({


  initialize: function(model, body, map) {
    this._idSource = 'connection_datasource';
    this._ids = ['connections_point'];
    
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
      'minzoom': 16,
      'paint': {
        'circle-radius': 4,
        'circle-color': 'blue',
      }
    }];
  }
});
