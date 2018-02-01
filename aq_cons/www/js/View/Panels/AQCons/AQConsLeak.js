'use strict';

App.View.Panels.Aq_cons.Leak = App.View.Panels.Splitted.extend({
  _mapInstance: null,

  initialize: function (options) {
    options = _.defaults(options, {
      dateView: true,
      id_category: 'aq_leak',
      spatialFilter: true,
      master: false,
      title: __('Tiempo real'),
      id_panel: 'leak',
      filteView: false,
    });
    _.bindAll(this,'_openDetails');
    
    App.View.Panels.Splitted.prototype.initialize.call(this, options);
    
    this.render();
  },

  customRender: function() {
    this._widgets = [];

    this._widgets.push(new App.View.Widgets.Aq_cons.FlowSectorRanking({
      id_scope: this.scopeModel.get('id'),
    }));

    this._widgets.push(new App.View.Widgets.Aq_cons.PressureSectorRanking({
      id_scope: this.scopeModel.get('id'),
    }));

    this._widgets.push(new App.View.Widgets.Aq_cons.FlowEvolution({
      id_scope: this.scopeModel.get('id'),
    }));

    this._widgets.push(new App.View.Widgets.Aq_cons.PressureEvolution({
      id_scope: this.scopeModel.get('id'),
    }));

    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$('.bottom .widgetContainer')
    }));
  },
  
  onAttachToDOM: function() {
    this._mapView = new App.View.Panels.Aq_cons.LeakMap({
      el: this.$('.top'),
      scope: this.scopeModel.get('id'),
      type: 'now'
    }).render();

    this.listenTo(this._mapView.mapChanges,'change:clickedSector', this._openDetails);

    this.subviews.push(this._mapView);
  },

  _onTopHidingToggled: function(e){
    if(this._mapView){
      this._mapView.$el.toggleClass('collapsed');
      setTimeout(function(){
        this._mapView.resetSize();
      }.bind(this), 300);
    }
  },

  _openDetails: function(e) {
    // 1.- Cleaning widget container
    this.$('.bottom .widgetContainer').html('');

    // 2.- Calling to renderer for detail's widget
    this.customRender();
    // this._customRenderDetails();
    
    // 3.- Reloading Masonry
    this.$('.bottom .widgetContainer').masonry('reloadItems',{
      gutter: 20,
      columnWidth: 360
    });
  },

  _customRenderDetails: function() {
    
  }

});
