App.Collection.Aq_cons.PanelList = Backbone.Collection.extend({
  initialize: function(models,options){
    var base = '/' + options.scopeModel.get('id') + '/' + options.id_category;
    var options = [
      {
        id : 'master',
        title: __('Estado General'),
        url:base + '/dashboard',
      },
      {
        id : 'forecast',
        title: __('Previsión semanal'),
        url:base + '/dashboard/forecast',
      },

    ];
    this.set(options);
  }
});

App.Collection.Aq_cons.ConsumptionStacked = Backbone.Collection.extend({
  initialize: function(models,options) {
      this.options = options;
  },

  url: function(){
    return App.config.api_url + '/' + this.options.scope +'/variables/timeserie'
  },

  parse: function(response) {
    response = _.map(response, function(r){
      return {'step':r.name, 'elements':_.filter(r.values, function(r) {return r.name!='closed'})};
    });
    response = _.each(response,function(r) {
      r.elements = _.map(r.elements, function(el){
        var json = {};
        json[el.name] = el.total;
        return json;
      });
    });

    return response;
  },

  fetch: function(options) {
    if(!options)
      options = {};

    var date = App.ctx.getDateRange();
    options['data'] = {
      'start': date.start,
      'finish': date.finish
    };

    return Backbone.Collection.prototype.fetch.call(this, options);
  }

});
