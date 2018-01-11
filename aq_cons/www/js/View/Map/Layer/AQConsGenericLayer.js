'use strict';

App.View.Map.Layer.Aq_cons.GenericLayer = App.View.Map.Layer.MapboxGLLayer.extend({


  initialize: function(config) {
    this.layers = config.layers;
    this._idSource = config.source.id;
    this._ids = config.layers.map(l => l.id);
    
    App.View.Map.Layer.MapboxGLLayer.prototype.initialize.call(this, config.source.model, config.source.payload, config.map);
  },

  _layersConfig: function() {
    return this.layers;
  }
});
