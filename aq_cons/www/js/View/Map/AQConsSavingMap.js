'use strict';

App.View.Panels.Aq_cons.SavingMap = App.View.Panels.Aq_cons.CurrentMap.extend({

  _template_legend: _.template('<div class="tags textleft">' +
  ' <div class="btnLegend no_border inrow">' +
  '    <span class="legend-map no-incidences">' + __('Sin incidencias') + '</span>' +
  '    <span class="legend-map leak">' + __('< Mínimo recomendado') + '</span>' +
  ' </div>' +
  '</div>'),

  dataLoaded: function(e) {
    if(e.sourceId === 'sensors_datasource') {
      let defaultSelected = _.find(e.source.data.features, function(f) { 
        return f.properties.index === 0
      });
      if(defaultSelected) {
        this.mapChanges.set('clickedSector', defaultSelected);
        this._map
          .off('dataloading', this.dataLoaded);
      }
    }
  },

  _onMapLoaded: function() {
    this.layers = new App.View.Map.Layer.Aq_cons.SectorSavingLayer(this._options, this._payload, this);
    this.events = _.extend({},this._events, this.events);
    this.delegateEvents();
  },

  _closeDetails: function() {
    this.mapChanges.set('clickedSector', undefined);
  },

  onClose: function() {
    if (this.layers) {
      this.layers.close();
    }
  }
});
