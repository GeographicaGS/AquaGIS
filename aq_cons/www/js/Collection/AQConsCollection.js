

App.Collection.AQCons.PanelList = Backbone.Collection.extend({
  initialize: function(models,options){
    var base = '/' + options.scopeModel.get('id') + '/' + options.id_category;
    var options = [
      {
        id : 'master',
        title: __('Estado General'),
        url:base + '/dashboard',
      },
      {
        id : 'prev',
        title: __('Previsión semanal'),
        url:base + '/dashboard/prev',
      },

    ];
    this.set(options);
  }
});
