'use strict';

App.View.Panels.Aq_cons.LeakMap =App.View.Panels.Aq_cons.CurrentMap.extend({
  _template_legend: _.template('<div class="tags textleft">' +
  ' <div class="btnLegend no_border inrow">' +
  '    <span class="legend-map normal">' + __('Funcionamiento normal') + '</span>' +
  '    <span class="legend-map anomaly">' + __('Anomalía de consumo') + '</span>' +
  '    <span class="legend-map leak">' + __('Posible fuga') + '</span>' +
  ' </div>' +
  '</div>'),

  _back_template: _.template('<div class="close-details"></div>'),
  _events: {
    'click .close-details': '_closeDetails'
  },

  _onMapLoaded: function() {
    this.layers = new App.View.Map.Layer.Aq_cons.SectorLeakLayer(this._options, this._payload, this);
    this.events = _.extend({},this._events, this.events);
    this.delegateEvents();
    
    this.drawLegend();
    this.listenTo(this.mapChanges,'change:clickedSector',function(e) {
      if (!this.$('.close-details').length) {
        this.$el.append(this._back_template);
      }
    });

    this.listenTo(this.mapChanges,'change:closeDetails',function(e) {
      if (e.get('closeDetails')) {
        this.$('.close-details').remove();
      }
    });
  },

  _closeDetails: function() {
    this.mapChanges.set('closeDetails', true);
  },

  onClose: function() {
    if (this.layers) {
      this.layers.close();
    }
  }
});
