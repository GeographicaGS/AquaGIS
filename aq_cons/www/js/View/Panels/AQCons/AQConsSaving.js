'use strict';

App.View.Panels.Aq_cons.Saving = App.View.Panels.Splitted.extend({
  _mapInstance: null,

  initialize: function (options) {
    options = _.defaults(options, {
      dateView: true,
      id_category: 'aq_cons',
      spatialFilter: true,
      master: false,
      title: __('Previsión de ahorro'),
      id_panel: 'saving',
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
    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$('.bottom .widgetContainer')
    }));
  },

  onAttachToDOM: function() {
    this._mapView = new App.View.Panels.Aq_cons.SavingMap({
      el: this.$('.top'),
      scope: this.scopeModel.get('id'),
      type: 'now'
    }).render();
    
    this.listenTo(this._mapView.mapChanges,'change:clickedSector', this._openDetails);
    this.$('#dateSelector').addClass('disabled');
    
    this.subviews.push(this._mapView);
  },

  _openDetails: function(e) {
    if(e.get('clickedSector') === undefined) {
      $("#titledetail").addClass('invisible');          
      this._closeDetails();
    } else {

      // 1.- Cleaning widget container
      let clicked = e.toJSON().clickedSector;
      this.$('.bottom .widgetContainer').html('');
  
      // 2.- Calling to renderer for detail's widget
      $("#titledetail").removeClass('invisible');          
      this.$('.bottom .widgetContainer').html('ID Sector: ' + clicked.properties.id_sector + ' - ID Sensor:' + clicked.properties.id_sensor);

      this._customRenderDetails(clicked);      
      
      // 3.- Reloading Masonry
      this.$('.bottom .widgetContainer').masonry('reloadItems',{
        gutter: 20,
        columnWidth: 360
      });

      setTimeout(() => {
        this.$('.bottom .widgetContainer').masonry();
      }, 300);

      // 4 - Set title of selection
      var $title_selection = $('.title_selection');
      var $title_selection_id = $('.title_selection_id');
      $title_selection.text(__('Depósito'));
      $title_selection_id.text(e.get('clickedSector').properties.id_entity);
    }
  },

  _onTopHidingToggled: function(e){
    if(this._mapView){
      this._mapView.$el.toggleClass('collapsed');
      setTimeout(function(){
        this._mapView.resetSize();
      }.bind(this), 300);
    }
  },

  _customRenderDetails: function(tank) {
    this._widgets = [];
    this._widgets.push(new App.View.Widgets.Aq_cons.TankSize({
      id_scope: this.scopeModel.get('id'),
      timeMode:'now',
    }));

    this._widgets.push(new App.View.Widgets.Aq_cons.EnergySavingInfo({
      id_scope: this.scopeModel.get('id'),
      timeMode:'now',
      tank: tank
    }));

    this._widgets.push(new App.View.Widgets.Aq_cons.EnergyConsumptionForecast({
      id_scope:this.scopeModel.get('id'),
      id_entity: tank.properties.id_entity
    }))

    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$('.bottom .widgetContainer')
    }));
  },

  onClose: function() {
    this._mapView.close();
    this.$('#dateSelector').removeClass('disabled');
    App.View.Panels.Splitted.prototype.onClose.call(this);    
  }

});
