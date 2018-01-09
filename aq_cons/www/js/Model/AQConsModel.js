App.Model.Aq_cons.Model = App.Model.Post.extend({
  initialize: function(options) {
    this.options = options;
  },

  url: function(options) {
     return `${App.config.api_url}/${this.options.scope}/maps/${this.options.entity}/now`; 
  },

  fetch: function(options) {
    options.data.filters.conditions = options.data.filters.conditions || {};
    return App.Model.Post.prototype.fetch.call(this, options);
  }
});