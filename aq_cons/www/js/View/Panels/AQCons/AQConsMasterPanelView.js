'use strict';

App.View.Panels.Aq_cons.Master = App.View.Panels.Base.extend({
  initialize: function(options) {
    options = _.defaults(options, {
      dateView: true,
      id_category: 'aq_cons',
      spatialFilter: false,
      master: true,
      title: __('Estado General'),
      id_panel: 'master'
    });

    App.View.Panels.Base.prototype.initialize.call(this, options);
    this.render();
  },

  customRender: function() {
    this._widgets = [];

    var m = new App.Model.Widgets.Base({
      entities : ['aq_cons.sector'],
      location : this.scopeModel.get('location'),
      zoom: this.scopeModel.get('zoom'),
      scope: this.scopeModel.get('id'),
      section: this.id_category,
      color: App.mv().getAdditionalInfo(this.id_category).colour,
      link : '/' + this.scopeModel.get('id') + '/' + this.id_category + '/dashboard/consume',
      title: __('Mapa'),
      timeMode:'now',
      titleLink: __('Previsión')
    });
    this._widgets.push(new App.View.WidgetDeviceMap({model: m}));

    this._widgets.push(new App.View.Widgets.Aq_cons.TotalConsumeWeeklyAverages({
      id_scope: this.scopeModel.get('id'),
      timeMode:'historic',
      link : '/' + this.scopeModel.get('id') + '/' + this.id_category + '/dashboard/consume',      
      titleLink: __('Previsión')      
    }));

    this._widgets.push(new App.View.Widgets.Aq_cons.TotalConsumeLastWeek({
      id_scope: this.scopeModel.get('id'),
      timeMode:'historic',
      link : '/' + this.scopeModel.get('id') + '/' + this.id_category + '/dashboard/historic',      
      titleLink: __('Histórico')            
    }));

    this._widgets.push(new App.View.Widgets.Aq_cons.ConsumptionForecastByLandUse({
      id_scope: this.scopeModel.get('id'),
      timeMode:'historic',
      link : '/' + this.scopeModel.get('id') + '/' + this.id_category + '/dashboard/consume',      
      titleLink: __('Previsión')      
    }));

    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$(".widgets")
    }));
    this.$('#dateSelector').addClass('disabled');
  }
});
