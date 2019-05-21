'use strict';

App.View.Widgets.Aq_cons.ConsumptionForecastByLandUseTimeserie = App.View.Widgets.Base.extend({

  initialize: function (options) {
    const nextWeek = App.Utils.getNextWeek();
    options = _.defaults(options, {
      title: __('Previsión de consumo según usos del suelo'),
      timeMode: 'historic',
      id_category: 'aq_cons',
      exportable: true,
      dimension: 'allWidth',
      publishable: true,
      // classname: 'App.View.Widgets.Aq_cons.ConsumptionForecastByLandUseTimeserie'
    });
    App.View.Widgets.Base.prototype.initialize.call(this, options);


    this.collection = new App.Collection.Variables.TimeserieGrouped([], {
      scope: this.options.id_scope,
      vars: ['aq_cons.sector.forecast'],
      agg: ['SUM'],
      start: nextWeek[0],
      finish: nextWeek[1],
      step: '1d',
      filters: {
        condition: {},
        group: 'aq_cons.sector.usage'
      }
    });

    // Parse response server
    this.collection.parse = this.parseDataCollection;

    this._chartModel = new App.Model.BaseChartConfigModel({
      colors: function (d, index) {
        var type = App.Static.Collection.Aq_cons.LandUses.get(d.realKey);
        if (!type) {
          type = App.Static.Collection.Aq_cons.LandUses.get('null');
        }
        return type.get('color');
      },
      legendNameFunc: function (d) {
        var type = App.Static.Collection.Aq_cons.LandUses.get(d);
        if (!type) {
          type = App.Static.Collection.Aq_cons.LandUses.get('null');
        }
        return type.get('name');
      },
      xAxisFunction: function (d) {
        var match, formatDate;
        if ((match = this.options.get('currentStep').match(/(\d)d/)) !== null) {
          formatDate = 'DD/MM';
        } else if ((match = this.options.get('currentStep').match(/(\d)h/)) !== null) {
          formatDate = 'DD/MM HH:mm';
        }
        return App.formatDate(d, formatDate);
      },
      yAxisFunction: [
        function (d) { return App.nbf(d, { decimals: 3 }) }
      ],
      yAxisLabel: [__('Consumo (m³)')],
      // yAxisDomain: [[0,100000]],
      currentStep: '1d',
      keysConfig: {
        'industrial': { type: 'bar', axis: 1 },
        'domestic': { type: 'bar', axis: 1 },
        'comercial': { type: 'bar', axis: 1 },
        '*': { type: 'bar', axis: 1 },
      },
      hideYAxis2: true,
      stacked: true
    });

    // this._chartModel.set({yAxisDomain: [0,40]});

    this.subviews.push(new App.View.Widgets.Charts.D3.BarsLine({
      opts: this._chartModel,
      data: this.collection
    }));
    // this.subviews.push(new App.View.Widgets.Charts.FillBarStacked({
    //   'opts': this._chartModel,
    //   'data': this.collection
    // }));

    this.filterables = [this.collection];
  },

  /**
   * Parse the server response
   * 
   * @param {Array} response - server response
   * @return {Array} - parsed response
   */
  parseDataCollection: function (response) {
    var aux = {};
    _.each(response, function (r) {
      _.each(r.data, function (data) {
        _.each(data, function (d) {
          if (!aux[d.agg]) {
            aux[d.agg] = [];
          }

          var curentDate = r.time.split('T').shift().split('-');
          var currentYear = Number.parseInt(curentDate[0], 10);
          var currentMonth = Number.parseInt(curentDate[1], 10);
          var currentDay = Number.parseInt(curentDate[2], 10);
    
          aux[d.agg].push({
            x: new Date(currentYear, currentMonth - 1, currentDay),
            y: d.value
          });
        });
      });
    });
    response = _.map(aux, function (values, key) {
      return { 'key': key, 'values': values, 'disabled': false }
    });
    return response;
  }
});
