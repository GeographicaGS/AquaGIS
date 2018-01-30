'use strict';

App.View.Widgets.Aq_cons.FlowEvolution = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Caudal total'),
      timeMode:'historic',
      id_category: 'aq_cons',
      exportable: true,
      dimension: 'allWidth',
      publishable: true,
      classname: 'App.View.Widgets.Lighting.FlowEvolution'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);


    this.collection = new App.Collection.Post([],{
      data: {
        agg: ["SUM"],
        vars: ["aq_cons.sector.flow"],
        groupagg: true,
        time: {
          start: moment().startOf('hour').subtract(1,'day').toDate(),
          finish: moment().startOf('hour').toDate(),
          step: '1h'
        },
        filters: App.ctx.get('bbox_status') && App.ctx.get('bbox') ? { bbox: App.ctx.get('bbox') } : {}
      },
    });

    this.collection.url = App.config.api_url + '/' + this.options.id_scope + '/variables/aq_cons.sector.flow/devices_group_timeserie';
    this.collection.parse = App.Collection.Variables.Timeserie.prototype.parse;

    var sectorFlowMetadata = App.mv().getVariable('aq_cons.sector.flow');
    var sectorKeys = {};
    var colors = ['#4D7BD9','#9966CC','#199183','#269DEF', '#64B6D9', '#64B7A3'];
    this._chartModel = new App.Model.BaseChartConfigModel({
      colors: function(d,i){
        var keysLength = Object.keys(sectorKeys).length;
        if(!sectorKeys[d.realKey]) {
          sectorKeys[d.realKey] = colors[keysLength % colors.length]
        } 
        return sectorKeys[d.realKey];
      },
      classes: function(d,i) {
        if(d.realKey !== 'avg') {
          return 'dashed';
        }
        return;
      },
      legendNameFunc: function(key,d){
        debugger;
        var data;
        var label = __('Nivel de caudal');
        if(key !== 'avg') {
          let coll = new App.Model.Base();
          coll.url = App.config.api_url + '/aljarafe/devices/aq_cons.sector/' + key + '/lastdata';
          coll.fetch({ async: false, success: function(e) {
            data = e.toJSON()}
          });
          let _ldata = _.find(data.lastdata, function(el) {
            return el.var_id === 'aq_cons.sector.name'
          });
          label = _ldata.var_value;
        }
        return label;
      },
      xAxisFunction: function(d) { return App.formatDate(d,'DD/MM HH:mm'); },
      yAxisFunction: [
        function(d) { return App.nbf(d)},
      ],
      yAxisLabel: [
        __('Caudal') + ' ('+ sectorFlowMetadata.get('units') +')',
      ],
      currentStep: '1h',
      keysConfig: {
        '*': {axis: 1, type: 'line'}
      },
      showLineDots: false,
    });

    this.subviews.push(new App.View.Widgets.Charts.D3.BarsLine({
      opts: this._chartModel,
      data: this.collection
    }));

    this.filterables = [this.collection];
  },
});
