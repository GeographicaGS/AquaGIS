'use strict';

App.View.Panels.Aq_simul.RatesMap = App.View.Map.MapboxView.extend({

  initialize: function (options) {
    options = _.defaults(options, {
      defaultBasemap: 'positron',
      sprites: '/verticals/aquasig-theme/mapstyle/sprite',      
      center: [-6.058731999113434, 37.34176929299322],
      type: 'now',
    });

    var prevWeek = App.Utils.getPrevWeek();   

    this._payload = {
      agg: 'SUM',
      var: 'aq_simul.sector.rates',
      time: {
          start: prevWeek[0],
          finish: prevWeek[1]
      },
      filters: {
        condition: {}
      }
    },

    App.View.Map.MapboxView.prototype.initialize.call(this, options);
  },

  _onMapLoaded: function() {
    this.layers = new App.View.Map.Layer.Aq_simul.PlotsLayer(this._options, this._payload, this);
  },

  _onBBoxChange: function(bbox) {
    if (App.ctx.get('bbox_status')) {
      let __bbox = [bbox.getNorthEast().lng,bbox.getNorthEast().lat,bbox.getSouthWest().lng,bbox.getSouthWest().lat]
      App.ctx.set('bbox', __bbox);
    }
  },

  onClose: function() {
    if(this.layers !== undefined)
      this.layers.close();
  },

  toggle3d: function(e) {
    App.View.Map.MapboxView.prototype.toggle3d.call(this,e);
    let zoom = this._map.getZoom();
    if(zoom < 16 && this._is3dActive) {
      this._map.easeTo({zoom: 16});
    }
    this._map.setLayoutProperty('plot_buildings', 'visibility', this._is3dActive ? 'visible' : 'none');
  }
});
