'use strict';

App.View.Widgets.Aq_cons.FlowEvolution = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Evolución del consumo eléctrico'),
      timeMode:'historic',
      id_category: 'lighting',
      exportable: true,
      dimension: 'allWidth',
      publishable: true,
      classname: 'App.View.Widgets.Lighting.FlowEvolution'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);


    this.collection = new App.Collection.Post([],{
      data: {
        agg: ["SUM"],
        vars: ["aq_cons.sector.flow"],
        groupagg: true,
        time: {
          start: moment().startOf('day').toDate(),
          finish: moment().endOf('day').toDate(),
          step: '1h'
        },
        filters: App.ctx.get('bbox_status') && App.ctx.get('bbox') ? { bbox: App.ctx.get('bbox') } : {}
      },
    });

    this.collection.url = App.config.api_url + '/' + this.options.id_scope + '/variables/aq_cons.sector.flow/devices_group_timeserie';
    this.collection.parse = App.Collection.Variables.Timeserie.prototype.parse;

    var sectorFlow = App.mv().getVariable('aq_cons.sector.flow');
    var keys = {};
    var colors = ['#4D7BD9','#9966CC','#199183','#269DEF', '#64B6D9', '#64B7A3'];
    this._chartModel = new App.Model.BaseChartConfigModel({
      colors: function(d,i){
        var keysLength = Object.keys(keys).length;
        if(!keys[d.key]) {
          keys[d.key] = colors[keysLength % colors.length]
        } 
        return keys[d.key];
      },
      classes: function(d,i) {
        if(d.key !== 'avg') {
          return 'dashed';
        }
      },
      legendNameFunc: function(d){
        var map = {
          'lighting.stcabinet.energyconsumed': __('Energía activa') + ' ('+ sectorFlow.get('units') +')',
        }
        return map[d];
      },
      legendOrderFunc: function(d){
        var idx = ['lighting.stcabinet.energyconsumed','lighting.stcabinet.reactiveenergyconsumed'].indexOf(d);
        if(idx === -1) idx = 99;
        return idx;
      },
      xAxisFunction: function(d) { return App.formatDate(d,'DD/MM HH:mm'); },
      // xAxisShowMaxMin: false,
      yAxisFunction: [
        function(d) { return App.nbf(d)},
        function(d) { return App.nbf(d)}
      ],
      yAxisLabel: [
        __('Energía activa') + ' ('+ sectorFlow.get('units') +')',
      ],
      currentStep: '1h',
      keysConfig: {
        '*': {axis: 1, type: 'line'}
      },

      showLineDots: false,
    });

    this.subviews.push(new App.View.Widgets.Charts.D3.BarsLine({
      opts: this._chartModel,
      data: this.collection
    }));

    this.filterables = [this.collection];
  },
});
