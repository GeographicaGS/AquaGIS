'use strict';

App.View.Widgets.Aq_cons.TankSize = App.View.Widgets.Base.extend({
  initialize: function (options) {
    this._template_legend = _.template("<div class='legendWidget'><span class='icon circle' style='background-color:<%= colors[0] %>'></span><span class='text' style='color:<%= colors[0] %>;font-weight:600'>" + __('Situación actual') + ": </span><span class='value'><%=App.nbf(data[0].values[0].y)%> m³</span></div>");

    options = _.defaults(options,{
      title: __('Capacidad del depósito'),
      timeMode: 'now',
      id_category: 'aq_cons',
      permissions: {'variables': ['aq_cons.sector.consumption']},
      publishable: false,
      classname: 'App.View.Widgets.Aq_cons.TankSize', 
    });

    App.View.Widgets.Base.prototype.initialize.call(this,options);

    let nextWeek = App.Utils.getNextWeek();

    if(!this.hasPermissions()) return;

    // Get min level, capacity and current level of tank
    let tankMinLevelPromise = new Promise((resolve, reject) => {
      let tankMinLevelModel = new App.Model.Variables({
        scope: this.options.id_scope,
        variable: 'aq_cons.tank.min_level',
        mode: 'now'
      });

      tankMinLevelModel.fetch({data: {
        "agg": "SUM"
      }});
      tankMinLevelModel.parse = (data) => {
        this.tankMinLevelData = data.value;
        resolve();
      }
    });
    let tankCapacityPromise = new Promise((resolve, reject) => {
      let nextWeek = App.Utils.getNextWeek();
      let tankCapacityModel = new App.Model.Variables({
        scope: this.options.id_scope,
        variable: 'aq_cons.tank.capacity',
        mode: 'now'
      });

      tankCapacityModel.fetch({data: {
        "agg": "SUM"
      }});
      tankCapacityModel.parse = (data) => {
        this.tankCapacityData = data.value;
        resolve();
      }
    })
    let tankLevelPromise = new Promise((resolve, reject) => {
      let nextWeek = App.Utils.getNextWeek();
      let tankLevelModel = new App.Model.Variables({
        scope: this.options.id_scope,
        variable: 'aq_cons.tank.level',
        mode: 'now'
      });

      tankLevelModel.fetch({data: {
        "agg": "SUM"
      }});
      tankLevelModel.parse = (data) => {
        this.tankLevelData = data.value;
        resolve();
      }
    })
    
    Promise.all([tankMinLevelPromise, tankCapacityPromise, tankLevelPromise]).then(() => { 

      let percentageMinLevelData = this.tankMinLevelData * this.tankCapacityData / 100;

      // Preparing data-model and options for tank capacity bar chart
      this.dataModel = new App.Model.Variables({
        scope: this.options.id_scope,
        variable: 'aq_cons.tank.level',
        data: {
          "agg": "SUM",
          "time": {
            "start": nextWeek[0],
            "finish": nextWeek[1]
          }
        },
        mode: 'now'
      });
  
      var variableMetadata = App.mv().getVariable('aq_cons.tank.capacity');
      if (variableMetadata.get('config') && variableMetadata.get('config').global_domain) {
        var domain = variableMetadata.get('config').global_domain;
      }
  
      this._chartModel = new App.Model.BaseChartConfigModel({
        colors: [this.tankLevelData > percentageMinLevelData ? '#64B6D9' : '#FB4C62'],
        xAxisFunction: function (d) {
          return "";
        },
        yAxisLabel: __('Capacidad (m³)'),
        legendNameFunc: function (d) {
          return __('Capacidad (m³)');
        },
        legendTemplate: this._template_legend,
        formatYAxis: {
          tickFormat: function (d) {
            return App.nbf(d, {decimals:0});
          }
        },
        divisorLines: [
          { value: percentageMinLevelData, color: "#FB4C62" },
          { value: 100, color: this.tankLevelData > percentageMinLevelData ? '#64B6D9' : '#FB4C62' },
        ]
      });

     
      this._chartModel.set({yAxisDomain: [0, this.tankCapacityData]});
  
      this.subviews.push(new App.View.Widgets.Charts.FillBar({
        opts: this._chartModel,
        data: this.dataModel
      }));
      
      this.filterables = [this.dataModel];
      this.render();
    });
  },

  render: function(){
    const prevWeek = App.Utils.getPrevWeek();
    App.View.Widgets.Base.prototype.render.call(this);
    $(this.$el.find('.date_tooltip .date span')[0]).text(App.formatDate(prevWeek[0]));
    $(this.$el.find('.date_tooltip .date span')[1]).text(App.formatDate(prevWeek[1]));
    return this;
  }

});
