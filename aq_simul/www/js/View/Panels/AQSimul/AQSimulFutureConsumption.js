'use strict';

App.View.Panels.Aq_simul.Futureconsumption =  App.View.Panels.Base.extend({

  initialize: function(options) {
    options = _.defaults(options, {
      dateView: false,
      id_category: 'aq_simul',
      spatialFilter: false,
      master: false,
      title: __('Consumo futuro'),
      id_panel: 'futureConsumption'
    });
    
    App.View.Panels.Splitted.prototype.initialize.call(this, options);
    
    this.model = {};

    this.render();
    
  },

  customRender: function() {
    this._widgets = [];
    this._scenarios = [];
    
    this.getConstructionTypesData().then((data) => {
      let constructionTypesData = data;
      let FutureScenarioModel = this.getFutureScenarioModel(constructionTypesData);

      this._widgets.push(new App.View.Widgets.Aq_simul.WaterUseTypes(constructionTypesData, {
        id_scope: this.scopeModel.get('id'),
        title: __('Tipos de uso de agua'),
        extended: true,
        editable: false,
        dimension: 'allHeight'
      }));
      
      this._widgets.push(new App.View.Widgets.Aq_simul.WaterTotalConsumption(FutureScenarioModel, {
        id_scope: this.scopeModel.get('id'),
        dimension: 'double',
      }));

      this.subviews.push(new App.View.Widgets.Container({
        widgets: this._widgets,
        el: this.$('.bottom .widgetContainer')
      }));

      this._mapView = new App.View.Panels.Aq_simul.FutureConsumptionMap({
        el: this.$('.top'),
        scope: this.scopeModel.get('id'),
        type: 'now'
      }).render();
      this.subviews.push(this._mapView);
    });

  },

  getConstructionTypesData: function () {
    return new Promise((resolve, reject) => {
      let constructionTypesModel = new App.Model.Aq_simul.ConstructionTypesModel({
        scope : this.scopeModel.get('id')
      });
      constructionTypesModel.fetch({data: {filters: {}}});
      constructionTypesModel.parse = (data) => {
        _.each(data, function(e) {
          e.rows = _.sortBy(e.rows, 'type_value')
          e.rowsCol1 = e.rows.slice(0, Math.ceil(e.rows.length/2))
          e.rowsCol2 = e.rows.slice(Math.ceil(e.rows.length/2))
        })
        resolve(data);
      }
    });
  },

  getFutureScenarioModel: function(data) {
    let paramsData = this.getParamsDataForFutureScenarioModel(data)
    return new App.Collection.Aq_simul.FutureScenario({
      scope : this.scopeModel.get('id'),
      data: paramsData
    });
  },

  getParamsDataForFutureScenarioModel: function (data)  {
    let paramsData = {
      tipo: 1
    };
    let constructionTypes = ["Vivienda", "Edificio", "Industria", "Uso terciario", "Hospedaje", "Instalación deportiva", "Piscina" ]
    let constructionTypesID = ["cantidadCasas", "cantidadEdificios", "cantidadIndustrial", "cantidadTerciarios", "cantidadHotel", "cantidadDeportivas", "cantidadPiscinas"]

    _.each(data, function(construction) {
      let indexConstruction = constructionTypes.indexOf(construction.type_name);
      let indexConstructionID = constructionTypesID[indexConstruction];
      paramsData[indexConstructionID] = [];
      if (indexConstructionID !== "cantidadPiscinas") {
        _.each(construction.rows, function(row) {
          paramsData[indexConstructionID].push(Number(row.count));
        })
      } else {
        paramsData["cantidadPiscinas"] = Number(construction.count);
      }
    })
    return paramsData;
  },
  
  _template: _.template($('#AQSimul-panels-future-consumption').html()),
  
  className: 'fill_height flex',

	events: _.extend(
    {
      'click .split_handler': 'toggleTopHiding',
      'click .co_fullscreen_toggle': 'toggleTopFullScreen',
      'click #btCreateScenario': 'createNewScenario',
      'click #btDeleteScenario': 'deleteScenario',
      'updateScenario': 'updateScenario'
    },
    App.View.Panels.Base.prototype.events
  ),


  updateScenario: function(e, model) {
    let comparativeModel = this.getFutureScenarioModel(model.data.constructionTypesModel)
    
    this.getConstructionTypesData().then((data) => {
      let constructionTypesData = data;
      let FutureScenarioModel = this.getFutureScenarioModel(constructionTypesData);

      // Get data from new scenario
      this.getComparativeFutureScenario(comparativeModel, model.data.constructionTypesModel).then((comparativeData) => {

        // Remove scenarios first
        this._scenarios = [];
        $(".scenariosContainer > div").remove();

        // Re-build construction type widget
        this._scenarios.push(new App.View.Widgets.Aq_simul.WaterUseTypes(model.data.constructionTypesModel, {
          id_scope: this.scopeModel.get('id'),
          title: __('Tipos de uso de agua'),
          extended: true,
          editable: true,
          dimension: 'allHeight'
        }));

        // Re-build water consumption widget with new data
        this._scenarios.push(new App.View.Widgets.Aq_simul.WaterTotalConsumption(FutureScenarioModel, {
          id_scope: this.scopeModel.get('id'),
          dimension: 'double',
        }, comparativeData));

        this.subviews.push(new App.View.Widgets.Container({
          widgets: this._scenarios,
          el: this.$('.bottom .scenariosContainer')
        }));
      })
    });
  },

  getComparativeFutureScenario: function(comparativeModel, constructionTypesData) {
    return new Promise((resolve, reject) => {
      let paramsData = this.getParamsDataForFutureScenarioModel(constructionTypesData);
      comparativeModel.fetch({ 
        data: paramsData, 
        success: function(model, response){
          resolve(response)
        }
      });
    })
  },

  toggleTopHiding: function(e){
    e.preventDefault();
    $(e.currentTarget).toggleClass('reverse');
    this.$('.bottom.h50').toggleClass('expanded');

    this._onTopHidingToggled(e);
  },

  // Actions to perform when the top panel hiding mode is toggled
  _onTopHidingToggled: function(e){
    if(this._mapView)
      this._mapView.$el.toggleClass('collapsed');

    if(this._dateView){
      this._dateView.$el.toggleClass('compact');
      this._dateView._compact = $(e.currentTarget).hasClass('reverse') ? true : false;
    }

    if(this._layerTree){
      this._layerTree.$el.removeClass('active').toggleClass('compact');
      this._layerTree.$el.find('h4.active').removeClass('active');
      this._layerTree._compact = $(e.currentTarget).hasClass('reverse') ? true : false;
    }

    if(this._mapSearch){
      this._mapSearch._clearSearch();
        this._mapSearch.toggleView();
    }

    this.$('.co_fullscreen_toggle').toggleClass('hide');
  },

  toggleTopFullScreen: function(e){
    e.preventDefault();
    $(e.currentTarget).toggleClass('restore');

    this.$('.split_handler').toggleClass('hide');
    this.$('.bottom.h50').toggleClass('collapsed');

    this._onTopFullScreenToggled();
  },

  createNewScenario: function () {
    
    this.getConstructionTypesData().then((data) => {
      let constructionTypesData = data;
      let FutureScenarioModel = this.getFutureScenarioModel(constructionTypesData);

      this._scenarios.push(new App.View.Widgets.Aq_simul.WaterUseTypes(constructionTypesData, {
        id_scope: this.scopeModel.get('id'),
        title: __('Tipos de uso de agua'),
        extended: true,
        editable: true,
        dimension: 'allHeight'
      }));

      this._scenarios.push(new App.View.Widgets.Aq_simul.WaterTotalConsumption(FutureScenarioModel, {
        id_scope: this.scopeModel.get('id'),
        dimension: 'double'
      }));

      this.subviews.push(new App.View.Widgets.Aq_simul.ScenariosContainer({
        widgets: this._scenarios,
        el: this.$('.bottom .scenariosContainer')
      }));

      $(".panel-future-consumption button.add").addClass('hide')
      $(".panel-future-consumption .scenarios-header").removeClass('hide');
    });
  },

  deleteScenario: function() {
    this._scenarios = [];
    $(".scenariosContainer > div").remove();
    $(".panel-future-consumption button.add").removeClass('hide')
    $(".panel-future-consumption .scenarios-header").addClass('hide');
  },


  // Actions to perform when the top panel full screen mode is toggled
  _onTopFullScreenToggled: function(){
    var _this = this;
    if(this._mapView){
      this._mapView.$el.toggleClass('expanded');
    	setTimeout(function(){
      	_this._mapView.resetSize();
    	}, 300);
    }
  }
});
