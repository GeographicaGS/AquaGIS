'use strict';

App.View.Panels.Aq_cons.LeakMap =App.View.Panels.Aq_cons.CurrentMap.extend({

  _onMapLoaded: function() {
    this.layers = new App.View.Map.Layer.Aq_cons.SectorLeakLayer(this._options, this._payload, this);

    this.drawLegend();
  },

  onClose: function() {
    if (this.layers) {
      this.layers.close();
    }
  }
});
