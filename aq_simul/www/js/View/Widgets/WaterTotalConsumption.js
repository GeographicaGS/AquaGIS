'use strict';

App.View.Widgets.Aq_simul.WaterTotalConsumption = App.View.Widgets.Base.extend({
  className: 'plugin-water-consumption',

  initialize: function (modelData, options, comparativeData) {
    options = _.defaults(options, {
      title: __('Total de consumo de agua'),
      id_category: 'aq_simul',
      publishable: false,
    });

    App.View.Widgets.Base.prototype.initialize.call(this, options);

    this.collection = modelData;
    this.collection.parse = (response) => {

      if (comparativeData) {
        this.$('.total-consumption-quantity').text(this.formatNumber(comparativeData.consumo.toFixed(2)));
      } else {
        this.$('.total-consumption-quantity').text(this.formatNumber(response.consumo.toFixed(2)));
      }

      let tempData = [{
        disabled: false,
        key: 'consumption',
        values: []
      }];
      
      _.each(response.consumoPorHoras, function (e, i) {
        if ((i + 2) % 2 == 0) {
          tempData[0].values.push({
            x: moment().startOf('day').add(e, 'hour').toDate(),
          });
        } else {
          tempData[0].values[tempData[0].values.length - 1]['y'] = response.consumoPorHoras[i]
        }
      })
      
      if (comparativeData) {
        let tempComparativeData = {
          disabled: false,
          key: 'consumptionComparative',
          values: []
        }
        _.each(comparativeData.consumoPorHoras, function (e, i) {
          if ((i + 2) % 2 == 0) {
            tempComparativeData.values.push({
              x: moment().startOf('day').add(e, 'hour').toDate(),
            });
          } else {
            tempComparativeData.values[tempComparativeData.values.length - 1]['y'] = comparativeData.consumoPorHoras[i]
          }
        })
        tempData.push(tempComparativeData);
      }

      return tempData;
    };

    this._chartModel = new App.Model.BaseChartConfigModel({
      colors: function (d, i) {
        if (comparativeData) {
          if (d.realKey === 'consumption') {
            return '#3B7DB9';
          }
          if (d.realKey === 'consumptionComparative') {
            return '#63b7da';
          }
        }
        return '#63b7da';
      },
      classes: function (d, i) {
        if (d.realKey !== 'avg') {
          return 'secondary';
        }
        return 'primary';
      },
      hideYAxis2: true,
      legendNameFunc: function (key, d) {
        if (comparativeData) {
          if (d.realKey === 'consumption') {
            return __('Consumo de agua original');
          }
          if (d.realKey === 'consumptionComparative') {
            return __('Consumo de agua simulado');;
          }
        }
        return __('Consumo de agua');
      }.bind(this),
      xAxisFunction: function (d) { 
        return App.formatDate(d, 'HH:mm'); 
      },
      yAxisFunction: [
        function (d) { return App.nbf(d) },
      ],
      yAxisLabel: [
        __('Consumo') + ' (m³)',
      ],
      currentStep: '1h',
      hideStepControl: true,
      keysConfig: {
        '*': { axis: 1, type: 'line' }
      },
      showLineDots: true,
    });

    this.subviews.push(new App.View.Widgets.Aq_simul.D3BarsLineCustom({
      opts: this._chartModel,
      data: this.collection
    }));

    this.filterables = [this.collection];
  },

  formatNumber: (x) => {
    return x.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
});
