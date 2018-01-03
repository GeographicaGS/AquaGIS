'use strict';

App.View.Map.AQCons.MapView = App.View.Map.MapboxView.extend({
  initialize: function(options) {
    App.View.Map.MapboxView.prototype.initialize.call(this, options);
  },

  render: function(options) {
    App.View.Map.MapboxView.prototype.render.call(this);
    return this;
  },

  changeBasemap: function(name) {
    console.log('Changing basemap');
    App.View.Map.MapboxView.prototype.changeBasemap.call(this,name);
  }

});