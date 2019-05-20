'use strict';

App.View.Panels.Aq_cons.Historic = App.View.Panels.Splitted.extend({
  _mapInstance: null,

  initialize: function (options) {
    options = _.defaults(options, {
      dateView: true,
      id_category: 'aq_cons',
      spatialFilter: true,
      master: false,
      title: __('Histórico'),
      id_panel: 'historic',
      filteView: false,
    });
    
    this.variableSelector = new App.View.Aq_cons.VariableSelector();
    
    this.listenTo(this.variableSelector.variable,'change',function(e) {
      if (this._mapView !== undefined) {
        this._mapView.updatePayloadVariable(e.get('variable'));
        this.widgetTimeSeries.filterables[0].options.data.vars = [e.get('variable')];
        this.widgetWeekly.filterables[0].url = this.widgetWeekly.filterables[0]
          .url.replace(/(.*\/)aq_cons\.sector\..*(\/.*)/,'$1' + e.get('variable') + '$2');
        
        this.widgetWeekly.refresh();
        this.widgetTimeSeries.refresh();
      }
    });
    this.listenTo(App.ctx, 'change:start change:finish', function(e) {
      if (this._mapView !== undefined) {
        this._mapView.updatePayloadTime(App.ctx.getDateRange());
      }
      if (this.widgetWeekly) {

        // Fix the changes in models and collections (BaseModel & BaseCollections)
        if (this.widgetWeekly.filterables[0].options &&
          typeof this.widgetWeekly.filterables[0].options.data === 'string') {
          this.widgetWeekly.filterables[0].options.data = JSON.parse(this.widgetWeekly.filterables[0].options.data);
        }

        this.widgetWeekly.filterables[0].options.data.time.start = App.ctx.getDateRange().start;
        this.widgetWeekly.filterables[0].options.data.time.finish = App.ctx.getDateRange().finish;      
      }
    });
    App.View.Panels.Splitted.prototype.initialize.call(this, options);

    this.widgetTimeSeries = new App.View.Widgets.Aq_cons.ConsumptionForecastByLandUseTimeserie({
      id_scope: this.scopeModel.get('id'),
      dimension: 'allWidth',
    });

    this.widgetWeekly = new App.View.Widgets.Aq_cons.TotalConsumeWeeklyAverages({
      id_scope: this.scopeModel.get('id'),
      dimension: 'allWidth',
      timeMode: 'historic'
    });
    
    this.render();
  },

  customRender: function() {

    // eslint-disable-next-line no-warning-comments
    // TODO - DELETE AFTER PRESENTATION (Presentation --> JULY 2019)

    // Search into the "subviews" the view
    // "DateView.js"
    var dateView = _.find(this.subviews, function (view) {
      return view.options && view.options.dateFormat;
    });
    var minDate = this.scopeModel.get('id') === 'ecija'
      ? new Date(2018, 10, 6)
      : new Date(2018, 0, 15); // Puerto real y Aljarafe
    var maxDate = this.scopeModel.get('id') === 'ecija'
      ? new Date(2018, 10, 13)
      : new Date(2018, 9, 31); // Puerto real y Aljarafe
    // Set options "minDate" and "maxDate"
    dateView._setOptions('minDate', minDate);
    dateView._setOptions('maxDate', maxDate);
    // END TODO - DELETE UP HERE

    this._widgets = [];

    this._widgets.push(this.widgetWeekly);
    
    this._widgets.push(this.widgetTimeSeries);

    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$('.bottom .widgetContainer')
    }));

  },

  onAttachToDOM: function() {
    var scopeLocation = this.scopeModel.get('location');

    this._mapView = new App.View.Panels.Aq_cons.CurrentMap({
      el: this.$('.top'),
      center: [scopeLocation[1], scopeLocation[0]],
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
