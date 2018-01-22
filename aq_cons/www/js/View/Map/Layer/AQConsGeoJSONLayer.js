'use strict';

App.View.Map.Layer.Aq_cons.GeoJSONLayer = App.View.Map.Layer.MapboxGLLayer.extend({


  initialize: function(config) {
    this.layerModifier = config.source.modifier;
    this.legendConfig = config.legend;
    this.layers = config.layers;
    this._ignoreOnLegend = config.ignoreOnLegend;
    this._idSource = config.source.id;
    this._ids = config.layers.map(l => l.id);
    this.popupTemplate = new App.View.Map.MapboxGLPopup('#AQCons-popups-base_popup');

    App.View.Map.Layer.MapboxGLLayer.prototype
      .initialize.call(this, config.source.model,
      config.source.payload,config.legend, config.map);
  },

  _layersConfig: function() {
    return this.layers;
  },

  setInteractivity: function(label, properties) {
    this.on('click',this.layers.map(l => l.id), function(e) {
      new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(this.popupTemplate
        .bindData(label,properties, e)).addTo(this._map._map);
    }.bind(this));
    return this;
  },

  setHoverable: function(isHoverable) {
    if (isHoverable) {
      this.on('mouseenter',_.map(this.layers,function(l) {return l.id}), function() {
        this._map._map.getCanvas().style.cursor = 'pointer';
      }.bind(this));

      this.on('mouseleave',_.map(this.layers,function(l) {return l.id}), function() {
        this._map._map.getCanvas().style.cursor = '';
      }.bind(this));
    }
    return this;
  },

  updatePaintOptions: function(options) {
    this.layers[0].paint['fill-color']['property'] = options;
    this._map._map.setPaintProperty(this._ids[0], 'fill-color', this.layers[0].paint['fill-color']);
  },
});
