'use strict';

App.View.Panels.Dumps.Current = App.View.Panels.Splitted.extend({

  initialize: function(options) {
    options = _.defaults(options, {
      dateView: true,
      category: 'aq_cons',
      master : false,
      title: __('Previsión semanal'),
      id_panel: 'prev',
      filterViewOpen: true
    });
    App.View.Panels.Splitted.prototype.initialize.call(this,options);
    this.render();
  },

  customRender: function(){
    this._widgets = [];

    //TONELADAS TOTALES DE
    // this._widgets.push(new App.View.Widgets.Dumps.TotalWeight({
    //   id_scope: this.scopeModel.get('id')
    // }));
  },

  onAttachToDOM: function(){

    // this._mapView = new App.View.Map.Dumps.Current({
    //   zoom: this.scopeModel.get('zoom'),
    //   center: this.scopeModel.get('location'),
    //   id_category: this.id_category,
    //   scope: this.scopeModel.get('id'),
    //   el: this.$('.top'),
    //   filterModel: this.filterModel,
    //   timeMode: 'now',
    //   title: __('Mapa de contenedores y el nivel de llenado de los mismos'),
    //   infoTemplate: $('#dumps-map_info_current_template').html(),
    //   legendTemplate: _.template($('#dumps-map_legend_current_template').html())({ threshold: varThresholds })
    // }).render();

    //this.subviews.push(this._mapView);
  }

});
