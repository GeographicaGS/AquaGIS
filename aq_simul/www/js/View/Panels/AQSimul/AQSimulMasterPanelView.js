'use strict';

App.View.Panels.Aq_simul.Master = App.View.Panels.Base.extend({
  initialize: function(options) {
    options = _.defaults(options, {
      dateView: false,
      id_category: 'aq_simul',
      spatialFilter: false,
      master: true,
      title: __('Estado General'),
      id_panel: 'master'
    });

    App.View.Panels.Base.prototype.initialize.call(this, options);

    this.getConstructionTypesModel().then(() => {
      this.render();
    });
  },

  customRender: function() {
    this._widgets = [];

    var m = new App.Model.Widgets.Base({
      entities : ['aq_simul.sector'],
      location : this.scopeModel.get('location'),
      zoom: this.scopeModel.get('zoom'),
      scope: this.scopeModel.get('id'),
      section: this.id_category,
      color: App.mv().getAdditionalInfo(this.id_category).colour,
      link : '/' + this.scopeModel.get('id') + '/' + this.id_category + '/dashboard/rates',
      title: __('Tarificación'),
      timeMode:'now',
      titleLink: __('Tarificación')
    });

    this._widgets.push(new App.View.WidgetDeviceMap({model: m}));


    this._widgets.push(new App.View.Widgets.Aq_simul.WaterUseTypes(this.constructionTypesData, {
      id_scope: this.scopeModel.get('id'),
      title: __('Usos del agua del ámbito'),
      timeMode:'historic',
      extended: false,
      editable: false,
      link : '/' + this.scopeModel.get('id') + '/' + this.id_category + '/dashboard/futureconsumption',      
      titleLink: __('Consumo futuro')
    }));

    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$(".widgets")
    }));
    
    this.$('#dateSelector').addClass('disabled');
  },

  getConstructionTypesModel: function () {
    return new Promise((resolve, reject) => {
      this.constructionTypesModel = new App.Model.Aq_simul.ConstructionTypesModel({
        scope : this.scopeModel.get('id')
      });
      this.constructionTypesModel.fetch({data: {filters: {}}});
      this.constructionTypesModel.parse = (data) => {
        this.constructionTypesData = data;
        resolve();
      }
    });
  },
});
