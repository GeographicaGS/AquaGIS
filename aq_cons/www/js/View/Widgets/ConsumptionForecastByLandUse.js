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

    // this._chartModel = new Backbone.Model({
    //   'scope': this.options.id_scope,
    //   'colors':['#E8BA4C', '#4ED8D8', '#9AC74A', '#CB727E'],
    //   'xAxisFunction': function(d) {
    //     return __(d);
    //   },
    //   'yAxisLabel': __('Consumo (m³)'),
    //   'hideTooltip':true,
    //   'showLegend': true,
    //   'legend': [__('Público'), __('Industrial'), __('Comercial'), __('Doméstica')]
    // });

    this._chartModel = new App.Model.BaseChartConfigModel({
      stacked: true,
      colors: ['#E8BA4C', '#4ED8D8', '#9AC74A', '#CB727E'],
      xAxisFunction: function(d) {
        return __(d);
      },
      yAxisLabel: __('Consumo (m³)'),
      legendNameFunc: function (d) {
        return __(d);
      },
      legendTemplate: this._template_legend,
      formatYAxis: {
        numberOfValues: 4,
        tickFormat: function (d) {
          var unit = 'm³';
          var value = App.nbf(d);
          if (domain && d === domain[1]) {
            value += unit;
          }
          return value;
        }
      }
    });

    this.subviews.push( new App.View.Widgets.Charts.FillBarStacked({
      'opts': this._chartModel,
      'data': this.collection
    }));

    this.filterables = [this.collection];
  }
});
