'use strict';

App.View.Panels.Aq_cons.CurrentMap = App.View.Map.MapboxView.extend({

  initialize: function (options) {
    options = _.defaults(options, {
      defaultBasemap: 'positron',
      sprites: '/verticals/aquagis-theme/mapstyle/sprite',      
      center: [-6.0738382, 37.3357641],
      type: 'now'
    });

    var nextWeek = App.Utils.getNextWeek();   

    this._payload = {
      agg: 'SUM',
      var: 'aq_cons.sector.forecast',
      time: {
          start: nextWeek[0],
          finish: nextWeek[1]
      },
      filters: {
        condition: {}
      }
    },

    this._template_legend = _.template(
      '<div class="tags textleft">' +
      ' <div class="btnLegend no_border">' +
      '   <span class="text first"><strong>' + __('Nivel de consumo (m³):') + '</strong></span>' +
      ' </div>' +
      ' <div class="btnLegend no_border inrow">' +
      '    <span class="text height12">0</span>' +
      '    <div class="ramp consume"></div>' +
      '    <span class="text height12">5 m³</span>' +
      ' </div>' +
      '</div>');
    App.View.Map.MapboxView.prototype.initialize.call(this, options);
    this.$el.append(this._template_legend);
  },

  _onMapLoaded: function() {
    this.layers = new App.View.Map.Layer.Aq_cons.GroupLayer(this._options, this._payload, this);

    this.drawLegend();
  },

  _onBBoxChange: function(bbox) {
    if (App.ctx.get('bbox_status')) {
      let __bbox = [bbox.getNorthEast().lng,bbox.getNorthEast().lat,bbox.getSouthWest().lng,bbox.getSouthWest().lat]
      App.ctx.set('bbox', __bbox);
    }
  },

  updatePayloadVariable: function(variable) {
    this._payload.var = variable;
    this.layers.updatePayload(this._payload);
  },

  updatePayloadTime: function(range) {
    this._payload.time = range;
    this.layers.updatePayload(this._payload);
  },

  onClose: function() {
    if(this.layers !== undefined)
      this.layers.close();
  }
});
