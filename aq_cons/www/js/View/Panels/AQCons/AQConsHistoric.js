'use strict';

App.View.Panels.Aq_cons.Historic = App.View.Panels.Splitted.extend({
  _mapInstance: null,

  initialize: function (options) {
    options = _.defaults(options, {
      dateView: true,
      id_category: 'aq_cons',
      spatialFilter: false,
      master: false,
      title: __('Histórico de previsiones'),
      id_panel: 'historic',
      filteView: false,
    });
    this.variableSelector = new App.View.Aq_cons.VariableSelector();
    this.listenTo(this.variableSelector.variable,'change',function(e) {
      if (this._mapView !== undefined) {
        this._mapView.updatePayloadVariable(e.get('variable'));
      }
    });
    this.listenTo(App.ctx, 'change:start change:finish', function(e) {
      if (this._mapView !== undefined) {
        this._mapView.updatePayloadTime(App.ctx.getDateRange());
      }
    });
    App.View.Panels.Splitted.prototype.initialize.call(this, options);
    this.render();
  },

  customRender: function() {
    this._widgets = [];
    // this._widgets.push(new App.View.Widgets.Aq_cons.ConsumptionForecastByLandUseTimeserie({
    //   id_scope: this.scopeModel.get('id')
    // }));

    this._widgets.push(new App.View.Widgets.Aq_cons.TotalConsumeWeeklyAverages({
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

    this.subviews.push(this._mapView);
    this.$el.append(this.variableSelector.render().$el);
    
  },

  _onTopHidingToggled: function(e){
    if(this._mapView){
      this._mapView.$el.toggleClass('collapsed');
    	setTimeout(function(){
      	this._mapView.resetSize();
    	}.bind(this), 300);
    }
  } 
});
