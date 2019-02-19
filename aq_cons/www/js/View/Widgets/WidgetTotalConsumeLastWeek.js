'use strict';

App.View.Widgets.Aq_cons.TotalConsumeLastWeek = App.View.Widgets.Base.extend({
  initialize: function (options) {
    this._template_legend = _.template("<div class='legendWidget'><span class='icon circle' style='background-color:<%= colors[0] %>'></span><span class='text' style='color:<%= colors[0] %>;font-weight:600'>" + __('Situación actual') + ": </span><span class='value'><%=App.nbf(data[0].values[0].y)%> m³</span></div>");

    options = _.defaults(options,{
      title: __('Consumo total semana anterior'),
      timeMode: 'now',
      id_category: 'aq_cons',
      permissions: {'variables': ['aq_cons.sector.consumption']},
      publishable: true,
      classname: 'App.View.Widgets.Aq_cons.TotalConsumeLastWeek'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    let prevWeek = App.Utils.getPrevWeek();
    if(!this.hasPermissions()) return;
    this.dataModel = new App.Model.Variables({
      scope: this.options.id_scope,
      variable: 'aq_cons.sector.consumption',
      data: {
        "agg": "SUM",
        "time": {
          "start": prevWeek[0],
          "finish": prevWeek[1]
        }
      },
      mode: 'historic'
    });

    var variableMetadata = App.mv().getVariable('aq_cons.sector.consumption');
    if (variableMetadata.get('config') && variableMetadata.get('config').global_domain) {
      var domain = variableMetadata.get('config').global_domain;
    }

    this._chartModel = new App.Model.BaseChartConfigModel({
      colors: ['#64B6D9'],
      xAxisFunction: function (d) {
        return __('Todos los sectores');
      },
      yAxisLabel: __('Consumo (m³)'),
      legendNameFunc: function (d) {
        return __('Consumo (m³)');
      },
      legendTemplate: this._template_legend,
      formatYAxis: {
        tickFormat: function (d) {
          return App.nbf(d, {decimals:3});
        }
      }
    });

    // this._chartModel.set({yAxisDomain: [0,100]});
    this._chartModel.set({yAxisDomain: [0,100]});

    this.subviews.push(new App.View.Widgets.Charts.FillBar({
      opts: this._chartModel,
      data: this.dataModel
    }));

    this.filterables = [this.dataModel];
  },

  render: function(){
    const prevWeek = App.Utils.getPrevWeek();
    App.View.Widgets.Base.prototype.render.call(this);
    $(this.$el.find('.date_tooltip .date span')[0]).text(App.formatDate(prevWeek[0]));
    $(this.$el.find('.date_tooltip .date span')[1]).text(App.formatDate(prevWeek[1]));
    return this;
  }

});
