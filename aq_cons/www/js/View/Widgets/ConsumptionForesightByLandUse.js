'use strict';

App.View.Widgets.Aq_cons.ConsumptionForesightByLandUse = Backbone.View.extend({

  initialize: function(options) {
  	this._scope = options.scope;
    this.render();
  },

  onClose: function(){
    if(this._stackedBarsView)
      this._stackedBarsView.close();

    this.stopListening();
  },

  render: function(){
  	var stackCollection = new App.Collection.Waste.IssueStacked([],{'scope':this.id_scope});
    var legend = App.Static.Collection.Waste.IssueStatusesFull.toJSON();
  	var stackModel = new Backbone.Model({
      'scope':this._scope,
      'title':__('Previsión de consumo por usos de suelo'),
      'colors':['#E8BA4C', '#4ED8D8', '#9AC74A', '#CB727E'],
      'xAxisFunction': function(d) {
      	return __(d);
      },
      'yAxisLabel': __('Consumo (m³)'),
      'hideTooltip':true,
      'url': '/' + this._scope + '/waste/operation/issues',
      'showLegend': true,
      'legend':_.map(_.reject(legend, function(l){ return l.id == 'closed'; }), function(i){ return i.name; })
    });
    this._stackedBarsView = new App.View.Widgets.Aq_cons.ConsumptionForesightByLandUseWrapper({
      'model':stackModel,
      'collection':stackCollection
    });
    this._stackedBarsView.$el.find('.chart').css({'padding-top':0});
    this.$el.html(this._stackedBarsView.$el);

    return this;
  }

});

App.View.Widgets.Aq_cons.ConsumptionForesightByLandUseWrapper = App.View.Widgets.StackedBars.extend({

  events: {
    'click .chart .nv-series': '_redrawYAxis',
  },

  _drawChart:function(){
  	App.View.Widgets.StackedBars.prototype._drawChart.apply(this);
    this.$('.chart').css({'padding-top':0});
  	this._redrawYAxis();
  },

  _redrawYAxis:function(e){
    if(e){
      e.stopPropagation();
      e.preventDefault();
    }

    var texts = this.$('.nv-x text');
    for(var i=0; i<texts.length; i++){
      var el = d3.select(texts[i]);
      var words = el.text().split(' ');
      // var words = el.text().match(/.{1,10}/g);
      el.text('');
      for (var y = 0; y < words.length; y++) {
        var tspan = el.append('tspan').text(words[y]);
        if (y > 0)
            tspan.attr('x', 0).attr('dy', '15');
      }
    }
  }

});
