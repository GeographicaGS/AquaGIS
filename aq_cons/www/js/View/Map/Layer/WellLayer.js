'use strict';

App.View.Map.Layer.WellLayer = App.View.Map.Layer.MapboxGLLayer.extend({


  initialize: function(model, body, map) {
    this._idSource = 'well_datasource';
    this._ids = ['well_point'];
    
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
      'paint': {
        'circle-radius': 6,
        'circle-color': 'yellow',
        'circle-stroke-width': 2,
        'circle-stroke-color': 'green',
      }
    }];
  }
});
