App.Collection.Aq_simul.PanelList = Backbone.Collection.extend({
  initialize: function(models,options){
    var base = '/' + options.scopeModel.get('id') + '/' + options.id_category;
    var _verticalOptions = [
      {
        id : 'master',
        title: __('Estado General'),
        url:base + '/dashboard',
      },
      {
        id : 'rates',
        title: __('Tarificación'),
        url:base + '/dashboard/rates',
      },
      {
        id : 'future',
        title: __('Consumo futuro'),
        url:base + '/dashboard/future',
      }
    ];
    this.set(_verticalOptions);
  }
});


App.Static.Collection.Aq_simul.LandUses = new Backbone.Collection([
  {id: 'domestic', name: __('Doméstico'), color: '#CB727E'},
  {id: 'industrial', name: __('Industrial'), color: '#4ED8D8'},
  {id: 'comercial', name: __('Comercial'), color: '#9AC74A'},
  {id: 'public', name: __('Público'), color: '#E8BA4C'},
]);

App.Static.Collection.Aq_simul.ConsumeRangeNumeric =  Backbone.Collection.extend({
  initialize: function() {
    _.bindAll(this,'findColor');
    this.add([{min: 0, max: 100, color: '#64B6D9'},
    {min: 100, max: 400, color: '#4CA7D7'},
    {min: 400, max: 1000, color: '#3397D5'},
    {min: 1000, max: 2000, color: '#1A88D3'},
    {min: 2000, max: 2600, color: '#0278D1'},
    {min: 2600, max: null, color: '#D56780'}])
  },
  findColor: function(d) {
    let color = undefined;
    if(d !== null) {
      color = _.find(this.models, function(e) {
        return e.get('min') <= d && (e.get('max') > d || e.get('max') === null)
      }).get('color');
    }
    return color || 'rgba(255, 255, 255, 0.05)';
  }
});

App.Static.Collection.Aq_simul.Weekdays =  new Backbone.Collection([
  {id:'Monday', name: 'L', fullName:__('Lunes')},
  {id:'Tuesday', name: 'M', fullName:__('Martes')},
  {id:'Wednesday', name: 'X', fullName:__('Miércoles')},
  {id:'Thursday', name: 'J', fullName:__('Jueves')},
  {id:'Friday', name: 'V', fullName:__('Viernes')},
  {id:'Saturday', name: 'S', fullName:__('Sábado')},
  {id:'Sunday', name: 'D', fullName:__('Domingo')}
]);
