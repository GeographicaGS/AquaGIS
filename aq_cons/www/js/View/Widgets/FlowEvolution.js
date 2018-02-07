'use strict';

App.View.Widgets.Aq_cons.FlowEvolution = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Caudal total'),
      timeMode:'now',
      id_category: 'aq_cons',
      exportable: true,
      dimension: 'allWidth',
      publishable: true,
      classname: 'App.View.Widgets.Lighting.FlowEvolution',
      stepsAvailable: ['1h','2h','4h']
    });
    

    App.View.Widgets.Base.prototype.initialize.call(this,options);
    

    // Getting sectors names
    this.sectorsNames = {};
    let sectorNamesCollection = new App.Collection.Base();
    sectorNamesCollection.url = App.config.api_url + '/aljarafe/entities/aq_cons.sector/elements';
    sectorNamesCollection.fetch({ async: false, success: function(e) {
      let tmp = e.toJSON();
      _.each(tmp, function(element) {
        this.sectorsNames[element.id] = element.name;
      }.bind(this));
    }.bind(this)});

    this.collection = new App.Collection.Post([],{
      data: {
        agg: ["SUM"],
        vars: ["aq_cons.sector.flow"],
        groupagg: true,
        time: {
          start: moment().startOf('hour').subtract(1,'day').toDate(),
          finish: moment().startOf('hour').toDate(),
          step: '1h'
        },
        filters: App.ctx.get('bbox_status') && App.ctx.get('bbox') ? { bbox: App.ctx.get('bbox') } : {}
      },
    });

    this.collection.url = App.config.api_url + '/' + this.options.id_scope + '/variables/aq_cons.sector.flow/devices_group_timeserie';
    this.collection.parse = App.Collection.Variables.Timeserie.prototype.parse;

    var sectorFlowMetadata = App.mv().getVariable('aq_cons.sector.flow');
    var sectorKeys = {};
    this._chartModel = new App.Model.BaseChartConfigModel({
      colors: function(d,i){
        return '#63b7da';
      },
      classes: function(d,i) {
        if(d.realKey !== 'avg') {
          return 'secondary';
        }
        return 'primary';
      },
      hideYAxis2: true,            
      legendNameFunc: function(key,d){
        var label = this.sectorsNames[key] || __('Nivel de caudal');
        return label;
      }.bind(this),

      xAxisFunction: function(d) { return App.formatDate(d,'DD/MM HH:mm'); },
      yAxisFunction: [
        function(d) { return App.nbf(d)},
      ],
      yAxisLabel: [
        __('Caudal') + ' ('+ sectorFlowMetadata.get('units') +')',
      ],
      currentStep: '1h',
      keysConfig: {
        '*': {axis: 1, type: 'line'}
      },
      showLineDots: false,
    });
  
    this.subviews.push(new App.View.Widgets.Aq_cons.D3BarsLineCustom({
      opts: this._chartModel,
      data: this.collection
    }));

    this.filterables = [this.collection];
  },
});
