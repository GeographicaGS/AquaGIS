'use strict';

App.View.Panels.Aq_simul.Rates = App.View.Panels.Map.extend({
  initialize: function(options) {
    options = _.defaults(options, {
      dateView: false,
      id_category: 'aq_simul',
      spatialFilter: false,
      master: false,
      title: __('Tarificación'),
      id_panel: 'rates'
    });

    App.View.Panels.Base.prototype.initialize.call(this, options);
    this.render();
  },

  customRender: function() {
  },


  onAttachToDOM: function() {
    this._mapView = new App.View.Panels.Aq_simul.RatesMap({
      el: this.$('.top'),
      scope: this.scopeModel.get('id'),
      type: 'now'
    }).render();

    this.listenTo(this._mapView.mapChanges,'change:clickedSector', this._openDetails);

    this.subviews.push(this._mapView);
  }

});
