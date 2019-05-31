'use strict';

App.View.Map.Layer.Aq_cons.GeoJSONLayer = App.View.Map.Layer.MapboxGLLayer.extend({


  initialize: function (config) {
    // Set "config" varibles to view variables 
    this._ignoreOnLegend = config.ignoreOnLegend;
    this._idSource = config.source.id;
    this._map = config.map;
    this._mapEvents = {};
    this._model = config.source.model;    
    this.layers = config.layers;
    this.legendConfig = config.legend;
    this._hasSourceData = typeof config.source.data !== 'undefined';
    // Setup popup template
    this.popupTemplate = new App.View.Map.MapboxGLPopup('#AQCons-popups-base_popup');

    // Setup map
    this._map._layers = this._map._layers.concat(this._layersConfig());
    // Add "source" to map
    if (typeof config.source.data !== 'undefined' && 
      config.source.data !== false) {
      // Fill source with "config.data"
      this._map.addSource(this._idSource, {
        type: 'geojson',
        data: config.source.data.data,
      });
    } else {
      // We will make request to get "data"
      this._map.addSource(this._idSource, {
        type: 'geojson',
        data: {
          type: "FeatureCollection",
          features: []
        },
      });
      this.listenTo(this._model, 'change', this._success);
      this.updateData(config.source.payload);  
    }
    // Others functions
    this._map.addLayers(this._layersConfig());
    this.addToLegend();
  },

  _layersConfig: function () {
    return this.layers;
  },

  setInteractivity: function (label, properties = [], deviceViewLink = false) {
    this.on('click', this.layers.map(l => l.id), function (e) {
      let mpopup = new mapboxgl.Popup()
        .setLngLat(e.lngLat);
      const featuresHolder = {features: e.features};
      if (deviceViewLink) {
        deviceViewLink = deviceViewLink.replace('{{device}}', e.features[0].properties.id_entity);
      }
      mpopup.setHTML(this.popupTemplate
        .drawTemplate(label, properties, featuresHolder, mpopup, deviceViewLink)).addTo(this._map._map);
    }.bind(this));
    return this;
  },

  setHoverable: function (isHoverable) {
    if (isHoverable) {
      this.on('mouseenter', _.map(this.layers, function (l) { return l.id }), function () {
        this._map._map.getCanvas().style.cursor = 'pointer';
      }.bind(this));

      this.on('mouseleave', _.map(this.layers, function (l) { return l.id }), function () {
        this._map._map.getCanvas().style.cursor = '';
      }.bind(this));
    }
    return this;
  },

  updatePaintOptions: function (options) {
    this.layers[0].paint['fill-color']['property'] = options;
    this._map._map.setPaintProperty(this._ids[0], 'fill-color', this.layers[0].paint['fill-color']);
  },

  _success: function (response) {
    // We cache the "source"
    if (response.changed.type && this._hasSourceData) {
      App.ctx.setMapSourceData({
        id: this._idSource,
        scope: this._map._options.scope,
        data: response.changed
      });
    }
    // Call parent function
    App.View.Map.Layer.MapboxGLLayer.prototype._success.call(this, response);
  }
});
