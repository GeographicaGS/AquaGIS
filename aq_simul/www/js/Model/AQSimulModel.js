App.Model.Aq_simul.PlotsModel = App.Model.Post.extend({
  initialize: function(options) {
    this.options = options;
  },

  url: function(options) {
    return App.config.api_url + "/" + this.options.scope + "/aq_simul/map/historic";
  },

  fetch: function(options = {}) {
    return App.Model.Post.prototype.fetch.call(this, options);
  }
});

App.Model.Aq_simul.RatesModel = App.Model.Post.extend({
  initialize: function(options) {
    this.options = options;
    this.__disableBackboneSyncInterceptor = true;
    this.__allowCrossOrigin = true;
  },

  url: function(options) {
    return "http://iatdev.isoin.es/aquasig-web/api/tarificacion/json";
  },

  fetch: function(options = {}) {
    return App.Model.Post.prototype.fetch.call(this, options);
  }
});
