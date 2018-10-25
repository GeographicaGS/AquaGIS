'use strict';

App.View.Widgets.Aq_simul.WaterUseTypes = Backbone.View.extend({

  _template: _.template( $('#AQSimul-widgets-water-use-types').html() ),
  className: 'plugin-water-types',

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
      data: {
        mode: options.mode,
        extended: options.extended,
        constructionTypesModel: data
      },
      formatNumber: (x) => {
        return x.toString().replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      }
    }
  },

  events: {
    'click .collapse-header' : 'toggleRow',
    'click .btApplyChanges' : 'setValueInModel',
    'click .btCancelChanges' : 'render',
    'change .quantity-edit' : 'updateTotalBuilds'
  },

  toggleRow: function(e) {
    $(e.currentTarget).toggleClass("opened");
  },

  render: function(data){
    this.$el.html(this._template(this.model));
    var _this = this;
      if (this.model.editable) {
        this.$el.find(".collapse-row").each(function() {
          var values = [];
          $(this).find(".quantity-edit").each(function(e) {
            values.push(Number($(this).val()));
          });
          var total = _.reduce(values, function(memo, num){ return memo + num; }, 0);
          total = _this.model.formatNumber(total)
          $(this).find(".collapse-header .total").text(total);
        })
      }

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
  },

  updateTotalBuilds: function(e) {
    var values = [];
    $(e.currentTarget).closest(".collapse-body").find(".quantity-edit").each(function(e) {
      values.push(Number($(this).val()));
    })
    var total = _.reduce(values, function(memo, num){ return memo + num; }, 0);
    total = this.model.formatNumber(total)
    $(e.target).closest(".collapse-row").find(".collapse-header .total").text(total);
  }
  
});
