'use strict';

App.View.Widgets.Aq_cons.PressureFlowLeakEvolution = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Presión media'),
      timeMode:'historic',
      id_category: 'aq_cons',
      exportable: true,
      dimension: 'allWidth',
      publishable: false,
      classname: 'App.View.Widgets.Lighting.PressureFlowLeakEvolution'
    });

    App.View.Widgets.Base.prototype.initialize.call(this,options);


    this.collection = new App.Collection.Post([],{
      data: {
        agg: ["AVG","AVG","MAX"],
        vars: ["aq_cons.sector.pressure","aq_cons.sector.flow","aq_cons.sector.leak_status"],
        time: {
          // start: moment().startOf('hour').subtract(1,'day').toDate(),
          // finish: moment().startOf('hour').toDate(),
          "start": "2018-01-10T00:00:00Z",
          "finish": "2018-01-11T00:00:00Z",
          step: '1h'
        },
        filters: {
          id_entity__eq: this.options.id_entity
        }
      },
    });

    this.collection.url = App.config.api_url + '/' + this.options.id_scope + '/variables/timeserie';
    this.collection.parse = App.Collection.Variables.Timeserie.prototype.parse;

    var sectorPressureMetadata = App.mv().getVariable('aq_cons.sector.pressure');
    this._chartModel = new App.Model.BaseChartConfigModel({
      colors: function(d,i){
        if (d.realKey === 'aq_cons.sector.pressure') {
          return '#F8CA1C'
        } else if(d.realKey === 'aq_cons.sector.flow') {
          return '#63b7da';
        }
        return '#F8CA1C';
      },
      classes: function(d,i) {
      },
      hideYAxis2: false,            
      xAxisFunction: function(d) { return App.formatDate(d,'DD/MM HH:mm'); },
      yAxisFunction: [
        function(d) { return App.nbf(d)},
      ],
      yAxisLabel: [
        __('Presión') + ' ('+ sectorPressureMetadata.get('units') +')',
      ],
      currentStep: '1h',
      keysConfig: {
        'aq_cons.sector.pressure': {axis: 1, type: 'line'},
        'aq_cons.sector.flow': {axis: 2, type: 'line'},
        'aq_cons.sector.leak_status': {axis: 2, type: 'alert'},
      },
      showLineDots: false,
    });

    this.subviews.push(new App.View.Widgets.Aq_cons.D3BarsLineCustom({
      opts: this._chartModel,
      data: this.collection
    }));

    this.filterables = [this.collection];
  },
});
