'use strict';

App.View.Panels.Aq_cons.Consume = App.View.Panels.Splitted.extend({
  _mapInstance: null,

  initialize: function (options) {
    options = _.defaults(options, {
      dateView: true,
      id_category: 'aq_cons',
      spatialFilter: true,
      master: false,
      title: __('Previsión Semanal'),
      id_panel: 'consume',
      filteView: false,
    });
    App.View.Panels.Splitted.prototype.initialize.call(this, options);
    var nextWeek = App.Utils.getNextWeek();   
    
    this.dateViewModel.set('start', moment.utc(nextWeek[0]));    
    this.dateViewModel.set('finish', moment.utc(nextWeek[1]));
    this.render();
  },

  customRender: function() {
    this._widgets = [];

    this._widgets.push(new App.View.Widgets.Aq_cons.TotalConsumeWeeklyAverages({
      id_scope: this.scopeModel.get('id'),
      dimension: 'allWidth',
    }));

    this._widgets.push(new App.View.Widgets.Aq_cons.ConsumptionForecastByLandUseTimeserie({
      id_scope: this.scopeModel.get('id'),
      dimension: 'allWidth',
    }));

    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$('.bottom .widgetContainer')
    }));
  },

  onAttachToDOM: function() {
    this._mapView = new App.View.Panels.Aq_cons.CurrentMap({
      el: this.$('.top'),
      scope: this.scopeModel.get('id'),
      type: 'historic'
    }).render();
    this.$('#dateSelector').addClass('disabled');
    this.subviews.push(this._mapView);
  },

  onClose: function() {
    this._mapView.close();
    this.$('#dateSelector').removeClass('disabled')    
  }
});
