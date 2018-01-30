'use strict';

App.View.Panels.Aq_cons.LeakMap =App.View.Panels.Aq_cons.CurrentMap.extend({
  _template_legend: _.template('<div class="tags textleft">' +
  ' <div class="btnLegend no_border inrow">' +
  '    <span class="legend-map normal">' + __('Funcionamiento normal') + '</span>' +
  '    <span class="legend-map anomaly">' + __('Anomalía de consumo') + '</span>' +
  '    <span class="legend-map leak">' + __('Posible fuga') + '</span>' +
  ' </div>' +
  '</div>'),

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
