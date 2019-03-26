'use strict';

App.View.Widgets.Aq_cons.PressureFlowLeakEvolution = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Peligro de fuga'),
      timeMode:'now',
      id_category: 'aq_cons',
      exportable: true,
      dimension: 'allWidth',
      publishable: false,
      classname: 'App.View.Widgets.Lighting.PressureFlowLeakEvolution'
    });

    App.View.Widgets.Base.prototype.initialize.call(this,options);
    var timeToShow = '2018-06-06';

    this.collection = new App.Collection.Post([],{
      data: {
        agg: ["AVG","AVG","MAX"],
        vars: ["aq_cons.sector.pressure","aq_cons.sector.flow","aq_cons.sector.leak_status"],
        time: {
          start: moment(timeToShow).startOf('hour').subtract(1,'day').toDate(),
          finish: moment(timeToShow).startOf('hour').toDate(),
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
        return '#FB4C62';
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
        __('Caudal') + ' ('+ App.mv().getVariable('aq_cons.sector.flow').get('units') +')',
      ],
      legendNameFunc: function(key,d){
        if (key === 'aq_cons.sector.pressure') {
          return 'Presión'
        } else if(key === 'aq_cons.sector.flow') {
          return 'Caudal';
        }
        return 'Fuga';
      },        
      currentStep: '1h',
      originalTooltip: true,
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
