App.Model.Aq_cons.Model = App.Model.Post.extend({
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

App.Collection.Aq_cons.PlotsModel = App.Collection.Base.extend({
  initialize: function(options) {
    this.options = options;
  },

  url: function(options) {
    return App.config.api_url + "/" + this.options.scope + "/aq_cons/plot/" + this.options.entity + "/constructions" ;
  },

  fetch: function(options = {}) {
    return App.Collection.Base.prototype.fetch.call(this, options);
  }
});

App.Model.Aq_cons.SensorModel = App.Model.Base.extend({
  initialize: function(options) {
    this.options = options;
  },

  url: function(options) {
    return App.config.api_url + "/" + this.options.scope + "/devices/aq_cons.sector/sector_id:" + this.options.entity + "/lastdata" ;
  },

  fetch: function(options = {}) {
    return App.Collection.Base.prototype.fetch.call(this, options);
  }
});