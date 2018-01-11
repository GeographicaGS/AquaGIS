'use strict';

App.View.Panels.Aq_cons.Consume2 = App.View.Panels.Splitted.extend({
  _mapInstance: null,

  initialize: function (options) {
    options = _.defaults(options, {
      dateView: true,
      id_category: 'aq_cons',
      spatialFilter: false,
      master: false,
      title: __('Consumo'),
      id_panel: 'consume2',
      filteView: false,
    });
    App.View.Panels.Splitted.prototype.initialize.call(this, options);
    this.render();
  },

  customRender: function() {
    this._widgets = [];
    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$('.bottom .widgetContainer')
    }));
  },

  onAttachToDOM: function() {
    this._mapView = new App.View.Panels.Aq_cons.CurrentMap({
      el: this.$('.top'),
      scope: this.scopeModel.get('id')
    }).render();

    this.subviews.push(this._mapView);
  }
});
