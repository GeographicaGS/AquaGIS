'use strict';

App.View.Panels.AQCons.Master = App.View.Panels.Base.extend({
  _mapInstance: null,
  initialize: function(options) {

    options = _.defaults(options, {
      dateView: true,
      id_category: 'aq_cons',
      spatialFilter: false,
      master: true,
      title: __('Estado General'),
      id_panel: 'master'
    });

    App.View.Panels.Base.prototype.initialize.call(this,options);
    this._mapInstance = new App.View.Map.AQCons.MapView({});
    this.render();
  },

  render: function() {
    this.subviews.push(this._mapInstance);
    App.View.Panels.Base.prototype.render.call(this);    
  },
});
