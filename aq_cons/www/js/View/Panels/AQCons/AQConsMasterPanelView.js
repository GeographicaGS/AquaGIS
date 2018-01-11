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

    this._widgets.push(new App.View.Widgets.Aq_cons.TotalConsumeLastWeek({id_scope: this.scopeModel.get('id')}));

    this._widgets.push(new App.View.Widgets.Aq_cons.ConsumptionForesightByLandUse({
      id_scope: this.scopeModel.get('id')
    }));

    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$(".widgets")
    }));
  }
});
