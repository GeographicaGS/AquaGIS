'use strict';

App.View.Map.Layer.Aq_cons.GenericLayer = App.View.Map.Layer.MapboxGLLayer.extend({


  initialize: function(source, layers, map) {
    this.layers = layers;
    this._idSource = source.id;
    this._ids = layers.map(l => l.id);
    
    App.View.Map.Layer.MapboxGLLayer.prototype.initialize.call(this, source.model, source.payload, map);
  },

  _layersConfig: function() {
    return this.layers;
  }
});
