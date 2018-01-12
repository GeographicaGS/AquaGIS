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

App.Static.Collection.Aq_cons.ConsumeRangeNumeric =  Backbone.Collection.extend({
  initialize: function() {
    _.bindAll(this,'findColor');
    this.add([{min: 0, max: 200, color: '#64B6D9'},
    {min: 200, max: 400, color: '#4CA7D7'},
    {min: 400, max: 600, color: '#3397D5'},
    {min: 600, max: 800, color: '#1A88D3'},
    {min: 800, max: 1000, color: '#0278D1'},
    {min: 1000, max: null, color: '#D56780'}])
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
