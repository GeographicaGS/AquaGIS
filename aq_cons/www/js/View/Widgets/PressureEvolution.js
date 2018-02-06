'use strict';

App.View.Widgets.Aq_cons.PressureEvolution = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Presión media'),
      timeMode:'now',
      id_category: 'aq_cons',
      exportable: true,
      dimension: 'allWidth',
      publishable: true,
      classname: 'App.View.Widgets.Lighting.PressureEvolution'
    });

    App.View.Widgets.Base.prototype.initialize.call(this,options);

    // Getting sectors names
    this.sectorsNames = {};
    let sectorNamesCollection = new App.Collection.Base();
    sectorNamesCollection.url = App.config.api_url + '/aljarafe/devices/mapentities?entities=aq_cons.sector';
    sectorNamesCollection.fetch({ async: false, success: function(e) {
      let tmp = e.toJSON();
      _.each(tmp, function(element) {
        this.sectorsNames[element.device_id] = _.find(element.lastdata, function(ldata) {
          return ldata.var === 'aq_cons.sector.name';
        }).value;
      }.bind(this));
    }.bind(this)});

    this.collection = new App.Collection.Post([],{
      data: {
        agg: ["AVG"],
        vars: ["aq_cons.sector.pressure"],
        groupagg: true,
        time: {
          start: moment().startOf('hour').subtract(1,'day').toDate(),
          finish: moment().startOf('hour').toDate(),
          step: '1h'
        },
        filters: App.ctx.get('bbox_status') && App.ctx.get('bbox') ? { bbox: App.ctx.get('bbox') } : {}
      },
    });

    this.collection.url = App.config.api_url + '/' + this.options.id_scope + '/variables/aq_cons.sector.pressure/devices_group_timeserie';
    this.collection.parse = App.Collection.Variables.Timeserie.prototype.parse;

    var sectorPressureMetadata = App.mv().getVariable('aq_cons.sector.pressure');
    this._chartModel = new App.Model.BaseChartConfigModel({
      colors: function(d,i){
        return '#F8CA1C';
      },
      classes: function(d,i) {
        if(d.realKey !== 'avg') {
          return 'secondary';
        }
        return 'primary';
      },
      hideYAxis2: true,            
      legendNameFunc: function(key,d){
        var label = this.sectorsNames[key] || __('Presión media');
        return label;
      }.bind(this),
      xAxisFunction: function(d) { return App.formatDate(d,'DD/MM HH:mm'); },
      yAxisFunction: [
        function(d) { return App.nbf(d)},
      ],
      yAxisLabel: [
        __('Presión') + ' ('+ sectorPressureMetadata.get('units') +')',
      ],
      currentStep: '1h',
      keysConfig: {
        '*': {axis: 1, type: 'line'}
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
