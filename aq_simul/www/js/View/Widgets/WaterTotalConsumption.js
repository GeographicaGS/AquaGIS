'use strict';

App.View.Widgets.Aq_simul.WaterTotalConsumption = App.View.Widgets.Base.extend({

  initialize: function(modelData, options) {
    options = _.defaults(options,{
      title: __('Total de consumo de agua'),
      id_category: 'aq_simul',
      publishable: false,
      classname: 'App.View.Widgets.Aq_simul.WaterTotalConsumption'
    });

    App.View.Widgets.Base.prototype.initialize.call(this,options);

    this.collection = modelData;
   
    this.collection.parse = function(response) {
      let tempData = {
        disabled: false,
        key: 'consumption',
        values: []
      }
      _.each(response.consumoPorHoras, function(e, i) {
        if ((i+2) % 2 == 0) {
          tempData.values.push ({
            x: moment().startOf('day').add(e,'hour').toDate(),
          });
        } else {
          tempData.values[tempData.values.length - 1]["y"] = response.consumoPorHoras[i]
        }
      })
      return tempData;
    };

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
        var label = __('Consumo de agua');
        return label;
      }.bind(this),
      xAxisFunction: function(d) { return App.formatDate(d,'HH:mm'); },
      yAxisFunction: [
        function(d) { return App.nbf(d)},
      ],
      yAxisLabel: [
        __('Consumo') + ' (m³)',
      ],
      currentStep: '1h',
      hideStepControl: true,
      keysConfig: {
        '*': {axis: 1, type: 'line'}
      },
      showLineDots: false,
    });

    this.subviews.push(new App.View.Widgets.Aq_simul.D3BarsLineCustom({
        opts: this._chartModel,
        data: this.collection
    }));

    this.filterables = [this.collection];
  }
});
