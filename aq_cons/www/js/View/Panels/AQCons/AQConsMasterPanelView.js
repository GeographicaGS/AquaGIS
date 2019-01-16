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

    this._widgets.push(new App.View.Widgets.Aq_cons.AlertsWidget({
      id_scope: this.scopeModel.get('id'),
      onclick: function(d) {
        return App.router.navigate(this.scopeModel.get('id') + '/aq_cons/dashboard/leak', {trigger: true});
      }.bind(this)
    }));

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

    this._widgets.push(new App.View.Widgets.Aq_cons.RankingSensor({
      id_scope: this.scopeModel.get('id'),
      property_unit: 'mg/L',
      sensor_property: 'dissolved_oxygen',
      timeMode: 'now',
      title:__('Oxígeno disuelto'),
    }));

    this._widgets.push(new App.View.Widgets.Aq_cons.RankingSensor({
      id_scope: this.scopeModel.get('id'),
      property_unit: 'μS/cm',
      sensor_property: 'electric_conductivity',
      timeMode: 'now',
      title:__('Conductividad eléctrica'),
    }));

    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$(".widgets")
    }));

    this.$('#dateSelector').addClass('disabled');

    // Button Print
    this.$('#dashboard').append(this.printButton())
  },

  /**
   * Add Print button in  web
   * @returns {Object} button object.
   */
  printButton: function () {
    return $('<div/>')
      .attr({
        id: 'printButton',
        class: 'button',
        title: __('Imprimir')
      })
      .on('click', function () {
        window.print();
      })
  }
});
