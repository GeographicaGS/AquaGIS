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
        title: __('Previsión Semanal'),
        url:base + '/dashboard/consume',
      },
      {
        id : 'historic',
        title: __('Histórico de previsiones'),
        url:base + '/dashboard/historic',
      }

    ];
    this.set(options);
  }
});


App.Static.Collection.Aq_cons.LandUses = new Backbone.Collection([
  {id: 'domestic', name: __('Doméstico'), color: '#CB727E'},
  {id: 'industrial', name: __('Industrial'), color: '#4ED8D8'},
  {id: 'comercial', name: __('Comercial'), color: '#9AC74A'},
  {id: 'public', name: __('Público'), color: '#E8BA4C'},
]);

App.Static.Collection.Aq_cons.ConsumeRangeNumeric =  Backbone.Collection.extend({
  initialize: function() {
    _.bindAll(this,'findColor');
    this.add([{min: 0, max: 1, color: '#64B6D9'},
    {min: 1, max: 2, color: '#4CA7D7'},
    {min: 2, max: 3, color: '#3397D5'},
    {min: 3, max: 4, color: '#1A88D3'},
    {min: 4, max: 5, color: '#0278D1'},
    {min: 5, max: null, color: '#D56780'}])
  },
  findColor: function(d) {
    let color = _.find(this.models, function(e) {
      return e.get('min') <= d && (e.get('max') > d || e.get('max') === null)
    }).get('color');
    return color || 'transparent';
  }
});

App.Static.Collection.Aq_cons.Weekdays =  new Backbone.Collection([
  {id:'Monday', name: 'L', fullName:__('Lunes')},
  {id:'Tuesday', name: 'M', fullName:__('Martes')},
  {id:'Wednesday', name: 'X', fullName:__('Miércoles')},
  {id:'Thursday', name: 'J', fullName:__('Jueves')},
  {id:'Friday', name: 'V', fullName:__('Viernes')},
  {id:'Saturday', name: 'S', fullName:__('Sábado')},
  {id:'Sunday', name: 'D', fullName:__('Domingo')}
]);
