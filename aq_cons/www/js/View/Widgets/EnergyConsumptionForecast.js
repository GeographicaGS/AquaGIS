// Copyright 2017 Telefónica Digital España S.L.
// 
// PROJECT: urbo-telefonica
// 
// This software and / or computer program has been developed by 
// Telefónica Digital España S.L. (hereinafter Telefónica Digital) and is protected as 
// copyright by the applicable legislation on intellectual property.
// 
// It belongs to Telefónica Digital, and / or its licensors, the exclusive rights of
// reproduction, distribution, public communication and transformation, and any economic
// right on it, all without prejudice of the moral rights of the authors mentioned above.
// It is expressly forbidden to decompile, disassemble, reverse engineer, sublicense or
// otherwise transmit by any means, translate or create derivative works of the software and
// / or computer programs, and perform with respect to all or part of such programs, any
// type of exploitation.
// 
// Any use of all or part of the software and / or computer program will require the
// express written consent of Telefónica Digital. In all cases, it will be necessary to make
// an express reference to Telefónica Digital ownership in the software and / or computer
// program.
// 
// Non-fulfillment of the provisions set forth herein and, in general, any violation of
// the peaceful possession and ownership of these rights will be prosecuted by the means
// provided in both Spanish and international law. Telefónica Digital reserves any civil or
// criminal actions it may exercise to protect its rights.

'use strict';

App.View.Widgets.Aq_cons.EnergyConsumptionForecast = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Consumo energético'),
      timeMode: 'historic',
      id_category: 'tank',
      dimension: 'allWidth',
      exportable: false,
      publishable: false,
      classname: 'App.View.Widgets.Aq_cons.EnergyConsumptionForecast'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);

    let nextWeek = App.Utils.getNextWeek();

    // Set collection
    this.collection = new App.Collection.Post([],{
      data: {
        agg: ["SUM","AVG","AVG","MIN"],
        vars: ["aq_cons.tank.capacity"],
        time: {
          start: moment().startOf('hour').subtract(1,'day').toDate(),
          finish: moment().startOf('hour').toDate(),
          step: '1h'
        },
        filters: { id_entity__eq: this.options.id_entity }
      },
    });
    this.collection.url = App.config.api_url + '/' + this.options.id_scope + '/variables/timeserie';
    this.collection.parse = App.Collection.Variables.Timeserie.prototype.parse;

    // Set chartModel
    this._chartModel = new App.Model.BaseChartConfigModel({
      colors: function(d,i){
        switch(d.realKey){
          case 'occupancy': return '#0066ff';
          case 'available': return App.Utils.rangeColor(App.Utils.RANGES.OK);
          case 'occupied': return App.Utils.rangeColor(App.Utils.RANGES.ERROR);
        }
      },
      legendNameFunc: function(d){
        var map = {
          'occupancy': __('Ocupación (%)'),
          'available': __('Plazas libres'),
          'occupied': __('Plazas ocupadas'),
        }
        return map[d];
      },
      xAxisFunction: function(d) { return App.formatDate(d,'DD/MM HH:mm'); },
      yAxisFunction: [
        function(d) { return App.nbf(d, {decimals: 0})},
        function(d) { return App.nbf(d, {decimals: 0})}
      ],
      yAxisLabel: [__('Ocupación (%)'),__('Plazas de aparcamiento')],
      yAxisDomain: [[0,100],[0,1]],
      
      keysConfig: {
        'occupancy': {type: 'line', axis: 1},
        'available': {type: 'bar', axis: 2},
        'occupied': {type: 'bar', axis: 2}
      },
      legendOrderFunc: function(d){
        var idx = ['occupancy','occupied','available'].indexOf(d);
        if(idx === -1) idx = 99;
        return idx;
      },
      stacked:true
    });

    // this.subviews.push(new App.View.Widgets.Charts.MultiChart({
    this.subviews.push(new App.View.Widgets.Aq_cons.D3BarsLineCustom({
      opts: this._chartModel,
      data: this.collection
    }));

    this.filterables = [this.collection];
  },
});
