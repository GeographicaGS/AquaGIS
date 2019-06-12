'use strict';

App.View.Widgets.Aq_cons.CurrentLeakStatusAllSectors = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: 'Estado: media del día',
      timeMode:'now',
      id_category: 'aq_cons',
      publishable: true,
      classname: 'App.View.Widgets.Aq_cons.CurrentLeakStatusAllSectors',
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);

    this._model = new App.Model.Post();
    // /aljarafe/devices/aq_cons.sector/sector_id:19/lastdata
    this._model.url = App.config.api_url + '/' + options.id_scope + '/variables/timeserie';
    this._model.fetch = function(options) {
      options.type = 'POST';
      options.data = {
        "agg": ["AVG", "AVG"],
        "vars": ["aq_cons.sector.flow", "aq_cons.sector.pressure"],
        "time": {
        "start": moment().startOf('hour').subtract(2,'hour').toDate(),
        "finish": moment().startOf('hour').subtract(1,'hour').toDate(),
        "step": "1d"
        }
      };
      options.data = JSON.stringify(options.data);

      this.constructor.__super__.fetch.call(this, options);
    }
    this._model.parse = function(data) {
      var _result = data[0].data;
      return _result;
    }
    
    this.subviews.push(new App.View.Widgets.MultipleVariable({
      collection: this._model, 
      variables: [
        {
          label: 'Caudal',
          param: 'aq_cons.sector.flow',
          class: 'flow',
          nbf: App.nbf,
          units: App.mv().getVariable('aq_cons.sector.flow').get('units')
        },
        {
          label: 'Presión',
          param: 'aq_cons.sector.pressure',
          class: 'pressure',
          nbf: App.nbf,        
          units: App.mv().getVariable('aq_cons.sector.pressure').get('units')
        }],
    }));
  }
});