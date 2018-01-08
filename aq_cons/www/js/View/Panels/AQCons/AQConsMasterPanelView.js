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
    let sector = new App.View.Panels.Aq_cons.Sector({scope: 'aljarafe', entity: 'aq_cons.sector'});
    this._sectorLayer = new App.View.Map.Layer.SectorLayer(sector, {
      filters: {
        bbox: [321.328125, 81.0932138526084, -284.765625000000069, -94.1624339680678],
        condition: {}
      }
    }, this._mapInstance);
  },

  _onBboxChange: function(bbox) {
    console.log(bbox);
  },
});
