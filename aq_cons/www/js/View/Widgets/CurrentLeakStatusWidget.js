'use strict';

App.View.Widgets.Aq_cons.CurrentLeakStatus = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: 'Estado actual del sector',
      timeMode:'now',
      id_category: 'aq_cons',
      publishable: true,
      classname: 'App.View.Widgets.Aq_cons.CurrentLeakStatus',
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);


    var collection = new App.Collection.Variables.Ranking(null, {
      id_scope: this.options.id_scope,
      data: {
        agg: ['SUM'],
        vars: [
          'aq_cons.sector.pressure',
          'aq_cons.sector.flow'
        ],
        var_order: 'aq_cons.sector.pressure',
        order: 'desc',
        limit: 5,
        time: {
          start: moment().startOf('hour').subtract(1, 'hour').toDate(),
          finish: moment().startOf('hour').toDate()
        }
      },
      mode: 'historic'
    });

    collection.parse = function(data) {
      return data[0];
    }

    this._model = collection;
    
    this.subviews.push(new App.View.Widgets.MultipleVariable({
      collection: this._model,
      searchParams: {
        agg: ['SUM', 'SUM'],
        vars: [
          'aq_cons.sector.pressure',
          'aq_cons.sector.flow'
        ],
        var_order: 'aq_cons.sector.pressure',
        order: 'desc',
        limit: 5,
        time: {
          start: moment().startOf('hour').subtract(1, 'hour').toDate(),
          finish: moment().startOf('hour').toDate()
        },
        filters: {
          condition: {
            id_entity__eq: options.id_entity
          }
        }
      },
      variables: [
        {
          label: 'Caudal',
          param: 'flow',
          class: 'flow',
          nbf: App.nbf,
          units: App.mv().getVariable('aq_cons.sector.flow').get('units')
        },
        {
          label: 'Presión',
          param: 'pressure',
          class: 'pressure',
          nbf: App.nbf,        
          units: App.mv().getVariable('aq_cons.sector.pressure').get('units')
        }],
    }));
  }
});