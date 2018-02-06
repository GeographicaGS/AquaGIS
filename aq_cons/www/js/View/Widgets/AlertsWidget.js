'use strict';

App.View.Widgets.Aq_cons.AlertsWidget = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: function(items) {
        // Can be function or string and accept HTML
        return '<strong>' + items.length + '</strong> ALERTAS DE CONSUMO';
      },
      timeMode:'now',
      id_category: 'aq_cons',
      dimension: 'allWidth reduced bgWhite scroll',
      publishable: true,
      classname: 'App.View.Widgets.Aq_cons.AlertsWidget',
      detailed: false,
      linked: true,
      workOrder: false,
      filter: 'all',
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    this._collection = new App.Collection.Base();
    this._collection.url = App.config.api_url + '/' + options.id_scope + '/entities/aq_cons.sector/elements';
    this._collection.parse = function(data) {
      data = _.map(data, function(d) {
        d.warning_level = d.leak_status;
        d.warning_description = d.leak_rule
        return d;
      });
      if(options.filter !== 'all') {
        data = _.filter(data, function(d) {
          return d.id === options.filter;
        });
      }
      return data;
    };
    
    this.subviews.push(new App.View.Widgets.AlertsVariable({
      collection: this._collection,
      title: options.title,
      detailedTitle: 'Análisis de la fuga',
      detailed: options.detailed,
      linked: options.linked,
      workOrder: options.workOrder,
      onclick: options.onclick,
      variables: [
      {
        label: 'Caudal',
        param: 'flow',
        color: '#64B6D9',
        nbf: App.nbf,
        type: 'number',
        units: App.mv().getVariable('aq_cons.sector.flow').get('units')
      },
      {
        label: 'Presión',
        param: 'pressure',
        color: '#F8CA1C',
        nbf: App.nbf,        
        type: 'number'    ,
        units: App.mv().getVariable('aq_cons.sector.pressure').get('units')
      }],
      searchParams: {
        variables: 'aq_cons.sector.leak_status,aq_cons.sector.leak_rule,aq_cons.sector.flow,aq_cons.sector.pressure'
      }
    }));

  },
});