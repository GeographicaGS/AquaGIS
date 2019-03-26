'use strict';

App.View.Widgets.Aq_cons.FlowLastHours = App.View.Widgets.Base.extend({

  initialize: function(options) {
    var that = this;
    options = _.defaults(options,{
      title: 'Caudal: Últimas 24 horas',
      timeMode:'now',
      id_category: 'aq_cons',
      publishable: false,
      classname: 'App.View.Widgets.Aq_cons.FlowLastHours',
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    this.searchParams = function(agg) {
      return {
        "agg": ["AVG","MIN","MAX"],
        "vars": ["aq_cons.sector.flow","aq_cons.sector.flow","aq_cons.sector.flow"],
        "time": {
          "start": moment().subtract(1,'day').toDate(),
          "finish": moment().toDate(),
          "step": "1d"
        },
        "filters": {
          "condition": {
          "id_entity__eq": options.id_entity
          }
        }
      };
    }
    
    this._model = new App.Model.Post();
    //  /aljarafe/variables/timeserie
    this._model.url = App.config.api_url + '/' + options.id_scope + '/variables/timeserie';

    this._model.parse = function(data) {
      var _result = {};
      if (data && data.length > 0) {
        _.each(data[0].data['aq_cons.sector.flow'], function(d) {
          _result[d.agg] = d.value;
        });
      }
      
      return _result;
    }
    
    
    this.subviews.push(new App.View.Widgets.MultipleVariable({
      collection: this._model, 
      searchParams: this.searchParams('AVG'),
      variables: [
        {
          label: 'Valor máximo',
          param: 'MAX',
          class: 'small agg max',
          nbf: App.nbf,
          units: App.mv().getVariable('aq_cons.sector.flow').get('units')
        },
        {
          label: 'Valor medio',
          param: 'AVG',
          class: 'small agg avg',          
          nbf: App.nbf,
          units: App.mv().getVariable('aq_cons.sector.flow').get('units')
        },
        {
          label: 'Valor mínimo',
          param: 'MIN',
          class: 'small agg min',          
          nbf: App.nbf,        
          units: App.mv().getVariable('aq_cons.sector.flow').get('units')
        }],
    }));
  }
});