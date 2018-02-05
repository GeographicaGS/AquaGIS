'use strict';

App.View.Widgets.Aq_cons.AlertsWidget = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: '',
      timeMode:'historic',
      id_category: 'aq_cons',
      dimension: 'allWidth reduced bgWhite scroll',
      publishable: true,
      classname: 'App.View.Widgets.Aq_cons.AlertsWidget',
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    this._collection = new App.Collection.Base();
    this._collection.url = App.config.api_url + '/' + options.id_scope + '/entities/aq_cons.sector/elements';
    this._collection.parse = function(data) {
      data = _.map(data, function(d) {
        d.warning_level = d.leak_status;
        return d;
      });
      return data;
    }
    
    this.subviews.push(new App.View.Widgets.AlertsVariable({
      collection: this._collection,
      title: function(items) {
        // Can be function or string and accept HTML
        return '<strong>' + items.length + '</strong> ALERTAS DE CONSUMO';
      },
      onclick: options.onclick,
      variables: [
      {
        label: 'Caudal',
        param: 'flow',
        color: '#F8CA1C',
        nbf: App.nbf,
        type: 'number',
        units: App.mv().getVariable('aq_cons.sector.flow').get('units')
      },
      {
        label: 'Presión',
        param: 'pressure',
        color: '#FB4C62',
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