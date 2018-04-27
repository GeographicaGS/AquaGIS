'use strict';

App.View.Widgets.Aq_cons.EnergySavingInfo = App.View.Widgets.Base.extend({

  _template: _.template($("#AQCons-widgets-energy_saving_info").html()),

  initialize: function(options) {

    options = _.defaults(options,{
      title: "Plan de ahorro",
      timeMode:'now',
      id_category: 'aq_cons',
      dimension: 'double bgWhite notMinHeight',
      bigTitle: true,
      id_category: 'aq_cons',
      detailed: false,
      className: 'App.View.Widgets.Aq_cons.EnergySavingInfo',
      detailed: false,
      linked: false,
      workOrder: false,
      filter: 'all',
    });
    
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    
    this._collection = new App.Collection.Post({}, {});
    this._collection.url = App.config.api_url + '/' + options.id_scope + '/aq_cons/tank/' + options.tank.properties.id_entity + '/plans';
    this._collection.parse = function(data) {
      this.options.data = data;
      return data;
    };

    this.subviews.push(new App.View.Widgets.Aq_cons.AlertsVariable({
      collection: this._collection,
      title: options.title,
      detailedTitle: 'Análisis de la fuga',
      detailed: options.detailed,
      linked: options.linked,
      workOrder: options.workOrder,
      onclick: options.onclick,
      variables: [
      {
        label: 'Ahorro de energía',
        param: 'energy_saved_ratio',
        color: '#96C147',
        nbf: App.nbf,
        type: 'percent',
        units: "%" // No metadata unit App.mv().getVariable('aq_cons.sector.flow').get('units')
      },
      {
        label: 'Ahorro aproximado',
        param: 'money_saved',
        color: '#F7A034',
        nbf: App.nbf,        
        type: 'number'    ,
        units: "€" // No metadata unit App.mv().getVariable('aq_cons.sector.pressure').get('units')
      },
      {
        label: 'Consumo energético',
        param: 'kwh_used',
        color: '#F7A034',
        nbf: App.nbf,        
        type: 'number'    ,
        units: App.mv().getVariable('aq_cons.tank.electricity_consumption_agg').get('units')
      },
      {
        label: 'Precio medio del agua',
        param: 'price_by_litre',
        color: '#F7A034',
        nbf: App.nbf,        
        type: 'number'    ,
        units: "€/litro" // No metadata unit App.mv().getVariable('aq_cons.sector.pressure').get('units')
      }],
      searchParams: {
        time: "2018-04-15"
      }
    }));
  },

  events: {
    'click #btnSpeak' : 'speakText'
  },

  speakText: function(e) {
    var text = $('#' + e.currentTarget.getAttribute("data-target")).text();
    App.Utils.speechSynthesis(text);
  }

});