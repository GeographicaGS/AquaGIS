'use strict';

App.View.Map.Layer.SectorLayer = App.View.Map.Layer.MapboxGLLayer.extend({


  initialize: function(model, body, map) {
    this._idSource = 'aqua_sectors';
    this._ids = ['sector'];
    
    App.View.Map.Layer.MapboxGLLayer.prototype.initialize.call(this, model, body, map);
  },

  _success: function(change) {
    App.View.Map.Layer.MapboxGLLayer.prototype._success.call(this, change);    
  },

  _layersConfig: function() {
    return this.layers = [{
      'id': this._ids[0],
      'type': 'fill',
      'source': this._idSource,
      'layout': {},
      'paint': {
          'fill-color': '#A8D5FF',
          'fill-opacity': 0.4
      }
    }];
  }
});
