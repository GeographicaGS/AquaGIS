'use strict';

App.View.Widgets.Aq_cons.ConsumptionForecastByLandUseTimeserie = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Evolución del consumo eléctrico'),
      timeMode:'historic',
      id_category: 'lighting',
      exportable: true,
      dimension: 'allWidth',
      publishable: true,
      classname: 'App.View.Widgets.Aq_cons.ConsumptionForecastByLandUseTimeserie'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);


    this.collection = new App.Collection.Post([],{
      data: {
        agg: ['SUM'],
        vars: ['aq_cons.sector.forecast'],
        time: {
          start: App.ctx.getDateRange().start,
          finish: App.ctx.getDateRange().finish,
          step: '1d'
        },
        filters: {
          condition: {},
          group: 'aq_cons.sector.usage'
        }
      },
    });

    this.collection.url = App.config.api_url + '/' + this.options.id_scope + '/variables/timeserie';
    this.collection.parse = App.Collection.Variables.Timeserie.prototype.parse;

    var energyconsumedMetadata = App.mv().getVariable('lighting.stcabinet.energyconsumed'),
        reactiveenergyMetadata = App.mv().getVariable('lighting.stcabinet.reactiveenergyconsumed');

    this._chartModel = new App.Model.BaseChartConfigModel({
      colors: function(d,index){
        var type = App.Static.Collection.Aq_cons.LandUses.get(d.realKey);
        return type.get('color');
      },
      legendNameFunc: function(d){
        var type = App.Static.Collection.Aq_cons.LandUses.get(d);
        return type.get('name');
      },
      // legendOrderFunc: function(d){
      //   var idx = ['lighting.stcabinet.energyconsumed','lighting.stcabinet.reactiveenergyconsumed'].indexOf(d);
      //   if(idx === -1) idx = 99;
      //   return idx;
      // },
      xAxisFunction: function(d) { return App.formatDate(d,'DD/MM HH:mm'); },
      // xAxisShowMaxMin: false,
      yAxisFunction: [
        function(d) { return App.nbf(d, {decimals: 0})}
      ],
      yAxisLabel: [__('Consumo (m³)')],
      yAxisDomain: [[0,100000]],
      currentStep: '1d',
      keysConfig: {
        'industrial': {type: 'bar', axis: 1},
        'domestic': {type: 'bar', axis: 1},
      },
      stacked: true,
    });

    this.subviews.push(new App.View.Widgets.Charts.D3.BarsLine({
      opts: this._chartModel,
      data: this.collection
    }));

    this.filterables = [this.collection];
  },
});
