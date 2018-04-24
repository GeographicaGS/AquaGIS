App.Model.Aq_simul.Model = App.Model.Post.extend({
  initialize: function(options) {
    this.options = options;
  },

  url: function(options) {
     return App.config.api_url + "/" + this.options.scope + "/maps/" + this.options.entity + "/" + this.options.type; 
  },

  fetch: function(options) {
    options.data.filters.conditions = options.data.filters.conditions || {};
    return App.Model.Post.prototype.fetch.call(this, options);
  }
});

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
  },

  url: function(options) {
    return "http://iatdev.isoin.es/aquasig-web/api/tarificacion/json";
  },

  fetch: function(options = {}) {
    return App.Model.Post.prototype.fetch.call(this, options);
  }
});

App.Model.Aq_simul.ConstructionTypesModel = App.Model.Post.extend({
  initialize: function(options) {
    this.options = options;
  },

  url: function(options) {
    return App.config.api_url + "/" + this.options.scope + "/aq_simul/simulation/count";
  },

  fetch: function(options = {}) {
    options.data.filters = options.data.filters || {};
    return App.Model.Post.prototype.fetch.call(this, options);
  }
});

App.Collection.Aq_simul.FutureScenario = App.Collection.Post.extend({
  initialize: function(options) {
    this.options = options;
    this.__disableBackboneSyncInterceptor = true;
    this.__allowCrossOrigin = true;
  },

  url: function(options) {
    return "http://iatdev.isoin.es/aquasig-web/api/escenariosfuturos/json";
  },

  fetch: function(options = {}) {
    delete options.data.filters;
    return App.Collection.Post.prototype.fetch.call(this, options);
  }
});

