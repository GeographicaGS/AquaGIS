'use strict';

App.View.Widgets.Aq_cons.ConsumptionForecastByLandUse = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Previsión de consumo por usos de suelo'),
      timeMode: 'now',
      id_category: 'aq_cons',
      permissions: {'variables': ['aq_cons.sector.forecast']},
      publishable: true,
      classname: 'App.View.Widgets.Aq_cons.ConsumptionForecastByLandUse'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);

    if(!this.hasPermissions()) return;

    this.collection = new App.Collection.Variables.Simple([], {
      scope: this.options.id_scope,
      vars: ['aq_cons.sector.forecast'],
      agg: ['SUM'],
      start: '2018-01-01T00:00:00Z',
      finish: '2018-01-01T00:00:00Z',
      step: '1d',
      filters: {
        condition: {},
        group: 'aq_cons.sector.usage'
      }
    });

    this._chartModel = new App.Model.BaseChartConfigModel({
      stacked: true,
      colors: function(d,index){
        var type = App.Static.Collection.Aq_cons.LandUses.get(d.realKey);
        return type.get('color');
      },
      xAxisFunction: function (d) {
        return __('Todos los sectores');
      },
      yAxisFunction: function(d){
        return App.nbf(d / 1000, {decimals:0});
      },
      yAxisLabel: __('Consumo (m³)'),
      legendTemplate: this._template_legend,
      legendNameFunc: function(d){
        var type = App.Static.Collection.Aq_cons.LandUses.get(d);
        return type.get('name');
      },
      formatYAxis: {
        numberOfValues: 4,
        tickFormat: function (d) {
          var unit = 'm³';
          var value = App.nbf(d / 1000, {decimals:0});
          if (domain && d === domain[1]) {
            value += unit;
          }
          return value;
        }
      }
    });

    if (!domain) {
      var domain = [0,100000000];
    }
    this._chartModel.set({yAxisDomain: domain});

    this.subviews.push( new App.View.Widgets.Charts.FillBarStacked({
      'opts': this._chartModel,
      'data': this.collection
    }));

    this.filterables = [this.collection];
  }
});
