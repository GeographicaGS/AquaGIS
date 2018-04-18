'use strict';

App.View.Widgets.Aq_simul.WaterUseTypes = Backbone.View.extend({

  _template: _.template( $('#AQSimul-plugins-water-use-types').html() ),

  initialize: function(data, options) {
    options = _.defaults(options,{
      title: __('Tipos de uso de agua'),
      classname: 'App.View.Widgets.Aq_simul.WaterUseTypes',
      id_category: 'aq_simul',
      mode: 'view'
    });
    

    this.model = {
      title: options.title,
      editable: options.editable,
      link: options.link,
      titleLink: options.titleLink,
      position: options.position,
      data: {
        mode: options.mode,
        extended: options.extended,
        constructionTypesModel: data
      }
    }

    this.defaultTotalConsumption = _.clone(data);
  },

  events: {
    'click .caret' : 'toggleRow',
    'click .btApplyChanges' : 'setValueInModel',
    'click .btCancelChanges' : 'render' 
  },

  toggleRow: function(e) {
    $(e.target).closest('.collapse-header').toggleClass("opened");
  },

  render: function(data){
    this.$el.html(this._template(this.model));
    return this;
  },

  hasPermissions: function() {
    return true;
  },

  setValueInModel: function(e, obj) {
    var $e = $(e.currentTarget);
    var blockTarget = $e.closest(".collapse-body");
    var modelType = _.find(this.model.data.constructionTypesModel, function(e) {
      return e.type_name ===  $e.data("type");
    })

    blockTarget.find(".type-item input").each((index, element) => {
      var $element = $(element);
      var subtype = $element.data("subtype") 
      var value = $element.val();
      var submodelType = _.find(modelType.rows, function(e) {
        return e.type_id === subtype;
      })
      submodelType.count = value;
    });

    $(this.el).trigger('updateScenario', [this.model]);
    // console.log(this.model.data.constructionTypesModel)
  }
});
