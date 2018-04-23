'use strict';

App.View.Widgets.Aq_cons.EnergySavingInfo = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: function(items) {
        let number = _.filter(items, function(item) {
          return item.warning_level !== 0;
        }).length;
        // Can be function or string and accept HTML
        return '<strong>' + number + '</strong> ALERTAS DE CONSUMO';
      },
      timeMode:'now',
      id_category: 'aq_cons',
      dimension: 'double reduced bgWhite scroll',
      publishable: true,
      classname: 'App.View.Widgets.Aq_cons.AlertsWidget',
      detailed: false,
      linked: true,
      workOrder: false,
      filter: 'all',
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    this._collection = new App.Collection.Post({},{data:{"time": new Date()}});
    this._collection.url = App.config.api_url + '/' + options.id_scope + '/aq_cons/tank/tank:1/plans';
    this._collection.parse = function(data) {
      console.log(data);
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
      }]
    }));

  },
});