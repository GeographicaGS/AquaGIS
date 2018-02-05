'use strict';

App.View.Widgets.Aq_cons.CurrentLeakStatus = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: 'Estado actual de la fuga',
      timeMode:'now',
      id_category: 'aq_cons',
      publishable: true,
      classname: 'App.View.Widgets.Aq_cons.CurrentLeakStatus',
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);

    this._model = new App.Model.Base();
    // /aljarafe/devices/aq_cons.sector/sector_id:19/lastdata
    this._model.url = App.config.api_url + '/' + options.id_scope + '/devices/aq_cons.sector/' + options.id_entity + '/lastdata';
    this._model.parse = function(data) {
      var _result = {};
       _.each(data.lastdata, function(ld) {
        _result[ld['var_id']] = ld['var_value'];
      });
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