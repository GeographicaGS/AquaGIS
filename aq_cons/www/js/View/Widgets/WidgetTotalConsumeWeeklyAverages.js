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

App.View.Widgets.Aq_cons.TotalConsumeWeeklyAverages = App.View.Widgets.Base.extend({

  initialize: function(options) {
    let nextWeek = App.Utils.getNextWeek();
    this._template_legend = _.template(
      '<div class="tags textleft">' +
      ' <div class="btnLegend no_border">' +
      '   <span class="text first"><strong>' + __('Nivel de consumo (m³)') + '</strong></span>' +
      ' </div>' +
      ' <div class="btnLegend no_border inrow">' +
      '    <span class="text height12">0</span>' +
      '    <div class="ramp consume"></div>' +
      '    <span class="text height12">1</span>' +
      '    <div class="max-value">' +
      '     <div class="maxcolor"></div> <span>&gt; ' + _('Consumo') + '</span>' +
      '    </div>' +
      ' </div>' +
      '</div>'
    );
    options = _.defaults(options,{
      title:__('Previsión de consumo semanal'),
      timeMode: 'now',
      id_category: 'aq_cons',
      classname: 'App.View.Widgets.Aq_cons.TotalConsumeWeeklyAverages',
      publishable: true,
      start: nextWeek[0],
      finish: nextWeek[1]
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);

    var xRrange = {};
    xRrange[__('Madrugada')] = 6;
    xRrange[__('Día')] = 9;
    xRrange[__('Tarde')] = 5;
    xRrange[__('Noche')] = 4;

    let consumeRangeNumeric = new App.Static.Collection.Aq_cons.ConsumeRangeNumeric();
    this._chartModel = new App.Model.BaseChartConfigModel({
      colors: consumeRangeNumeric.findColor,
      legendTemplate: this._template_legend,
      xRrange:xRrange,
      xRangeLabels: {
        start: true,
        end: false,
      },
      keySerie: __('Suma'),
      startDate: moment("00:00", "HH:mm"),
      nextDateFunction:function(d){
        return d.add(1,'hours');
      },
      dateFunction:function(d){
        return d.format('HH:mm');
      },
      yAxisFunction: function(d){
        var type = App.Static.Collection.Aq_cons.Weekdays.get(d);
        return type ? type.get('name') : d;
      },
      yAxisFunctionPopup: function(d){
        var type = App.Static.Collection.Aq_cons.Weekdays.get(d);
        return type ? __(type.get('fullName')) : d;
      },
      xAxisFunctionPopup: function(d){
        return App.nbf(d, {decimals: 2}) + ' m³';
      }

    });
    this.collection = new App.Collection.Post([],{
      data: {
        agg: ["SUM"],
        vars: ["aq_cons.sector.forecast"],
        time: {
          start: nextWeek[0],
          finish: nextWeek[1],
          step: "1h"
        },
        filters: App.ctx.get('bbox_status') && App.ctx.get('bbox') ? { bbox: App.ctx.get('bbox') } : {}
      },
    });

    this.collection.url = App.config.api_url + '/' + this.options.id_scope + '/variables/' + 'aq_cons.sector.forecast' + '/weekserie';

    this.subviews.push(new App.View.Widgets.Charts.Grid({
      opts: this._chartModel,
      data: this.collection
    }));

    this.filterables = [this.collection];

  },

  render: function() {
    this.$el.attr('id','widgetTotalConsumeWeeklyAverage');
    return App.View.Widgets.Base.prototype.render.call(this);
    
  }

});
