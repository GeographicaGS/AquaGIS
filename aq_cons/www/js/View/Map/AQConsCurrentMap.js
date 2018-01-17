'use strict';

App.View.Panels.Aq_cons.CurrentMap = App.View.Map.MapboxView.extend({

  _payload: {
    filters: {
      condition: {}
    }
  },
  
  initialize: function (options) {
    options = _.defaults(options, {
      defaultBasemap: 'positron',
      sprites: '/verticals/aquagis-theme/mapstyle/sprite',      
      center: [-6.0738382, 37.3357641]
    });
    App.View.Map.MapboxView.prototype.initialize.call(this, options);
  },

  _onMapLoaded: function() {
    this.layers = new App.View.Map.Layer.Aq_cons.GroupLayer(this._options, this._payload, this);

    this.drawLegend();
  },

  _onBBoxChange: function(bbox) {
    console.log(bbox);
  },

  onClose: function() {
    this.layers.close();
  }
});
