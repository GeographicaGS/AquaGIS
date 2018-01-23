App.View.Aq_cons.VariableSelector = Backbone.View.extend({

  events: {
    'change #vselector': 'changeVariable'
  },

  initialize: function(map) {
    this.variable = new Backbone.Model();
    this._template = _.template($('#AQCons-variable_selector').html());
  
  },

  render: function() {
    this.$el[0].id = 'variableselector';
    this.$el.append(this._template({'variables': [{
      'value':'aq_cons.sector.forecast',
      'name':'Previsión',
    }, {
      'value':'aq_cons.sector.consumption',
      'name':'Consumo',
    }]}));
    return this;
  },

  changeVariable: function(e) {
    this.variable.set('variable',e.target.value);
  }

});