'use strict';

App.View.Panels.Aq_cons.SavingMap = App.View.Panels.Aq_cons.CurrentMap.extend({

  dataLoaded: function(e) {
    setTimeout(function() {
      if(e.isSourceLoaded && e.sourceId === 'sensors_datasource') {
        let defaultSelected = _.find(e.source.data.features, function(f) { 
          return f.properties.index === 0
        });
        this.mapChanges.set('clickedSector', defaultSelected);
        this._map
          .off('sourcedata', this.dataLoaded.bind(this));
      }
    }.bind(this),200)
  },

  _onMapLoaded: function() {
    this.layers = new App.View.Map.Layer.Aq_cons.SectorSavingLayer(this._options, this._payload, this);
    this.events = _.extend({},this._events, this.events);
    this.delegateEvents();
    this.drawLegend();
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
