'use strict';

App.View.Panels.Aq_cons.Master = App.View.Panels.Base.extend({
  _mapInstance: null,

  initialize: function (options) {
    options = _.defaults(options, {
      dateView: true,
      id_category: 'aq_cons',
      spatialFilter: false,
      master: true,
      title: __('Estado General'),
      id_panel: 'master'
    });

    let optionsMap = {
      defaultBasemap: 'positron',
      center: [-6.0738382, 37.3357641]
    }

    App.View.Panels.Base.prototype.initialize.call(this, options);
    this._mapInstance = new App.View.Map.MapboxView(optionsMap);
    this.listenTo(this._mapInstance.mapChanges,'change',(change)=>{
      if (change.changed.loaded) {
        this._onMapLoaded()
      } else if (change.changed.bbox) {
        this._onBboxChange(change.changed.bbox);
      }
    });
    this.render();
  },

  render: function () {
    this.subviews.push(this._mapInstance);
    App.View.Panels.Base.prototype.render.call(this);
  },

  _onMapLoaded: function() {
    let sensor = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.sensor'});
    let sector = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cons.sector'});
    let tank = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.tank'});
    let connection = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.connections_point'});
    let connectionLine = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.connections_line'});
    this._sectorLayer = new App.View.Map.Layer.SectorLayer(sector, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
    this._sensorLayer = new App.View.Map.Layer.SensorLayer(sensor, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
    this._tankLayer = new App.View.Map.Layer.TankLayer(tank, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
    this._connectionLayer = new App.View.Map.Layer.ConnectionLayer(connection, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
    this._connectionLineLayer = new App.View.Map.Layer.ConnectionLineLayer(connectionLine, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
  },

  _onBboxChange: function(bbox) {
    console.log(bbox);
  },
});
