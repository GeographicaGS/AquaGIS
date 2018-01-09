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
    // Modelos
    let sensor = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.sensor'});
    let sector = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cons.sector'});
    let tank = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.tank'});
    let connection = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.connections_point'});
    let connectionLine = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.connections_line'});
    let supply = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.supply_point'});
    let supplyLine = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.supply_line'});
    let hydrant = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.hydrant_point'});
    let hydrantLine = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.hydrant_line'});
    let valve = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.valve_point'});
    let valveLine = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.valve_line'});
    let well = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.well_point'});
    let wellLine = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.well_line'});
    let plot = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.plot'});
    let plotStructure = new App.Model.Aq_cons.Model({scope: 'aljarafe', entity: 'aq_cata.plot_structure'});


    // Layers
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
    this._supplyLayer = new App.View.Map.Layer.SupplyLayer(supply, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
    this._supplyLineLayer = new App.View.Map.Layer.SupplyLineLayer(supplyLine, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
    this._hydrantLayer = new App.View.Map.Layer.HydrantLayer(hydrant, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
    this._hydrantLineLayer = new App.View.Map.Layer.HydrantLineLayer(hydrantLine, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
    this._valveLayer = new App.View.Map.Layer.ValveLayer(valve, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
    this._valveLineLayer = new App.View.Map.Layer.ValveLineLayer(valveLine, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
    this._wellLayer = new App.View.Map.Layer.WellLayer(well, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
    this._wellLineLayer = new App.View.Map.Layer.WellLineLayer(wellLine, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
    this._plotLayer = new App.View.Map.Layer.PlotLayer(plot, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
    this._plotLineLayer = new App.View.Map.Layer.PlotStructureLayer(plotStructure, {
      filters: {
        condition: {}
      }
    }, this._mapInstance);
  },

  _onBboxChange: function(bbox) {
    console.log(bbox);
  },
});
