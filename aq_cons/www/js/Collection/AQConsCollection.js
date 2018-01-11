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
        id : 'consume',
        title: __('Consumo'),
        url:base + '/dashboard/consume',
      }

    ];
    this.set(options);
  }
});
