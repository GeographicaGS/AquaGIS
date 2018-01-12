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

App.Static.Collection.Aq_cons.LandUses = new Backbone.Collection([
  {id: 'domestic', name: __('Doméstica'), color: '#CB727E'},
  {id: 'industrial', name: __('Industrial'), color: '#4ED8D8'},
  {id: 'comercial', name: __('Comercial'), color: '#9AC74A'},
  {id: 'public', name: __('Público'), color: '#E8BA4C'},
]);
