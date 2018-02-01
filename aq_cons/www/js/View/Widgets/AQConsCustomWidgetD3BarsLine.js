'use strict';

App.View.Widgets.Aq_cons.D3BarsLineCustom = App.View.Widgets.Charts.D3.BarsLine.extend({
  _events: {
    'mouseenter .btnLegend .text.first': '_hoverLegend',
    'mouseleave .btnLegend .text.first': '_hoverOut',
    'mouseenter g.lineGroup[key] > circle': '_hoverCircle',
    'mouseleave g.lineGroup[key] > circle': '_hoverOut',    
  },
  initialize: function(options){
    App.View.Widgets.Charts.D3.BarsLine.prototype.initialize.call(this,options);
    this.events = _.extend({},this._events, this.events);
    this.delegateEvents();
  },
  render: function(){
    if (this.options.has('currentStep')) {
      if (!this.options.has('stepsAvailable')) {
        this.options.set({ stepsAvailable: ['1h','2h','4h']});
      }
    }
    this.setElement(this._template({
      'm': this.options.toJSON()
    }));

    this.$el.append(App.widgetLoading());
    // this._fetchData();

    try{
      this._fetchData();
    }catch(e){

      this._drawChart();
    }

    return this;
  },
  _fetchData: function(){
    var requestData = this.collection.options.data;

    // Step
    if(this.options.get('currentStep')){
      requestData.time.step = this.options.get('currentStep');
    }

    // Aggregation
    if(this._aggregationInfo){
      var _this = this;
      var aggs = [];
      _.each(this.collection.options.data.vars, function(var_id){
        if(_this && _this._aggregationInfo[var_id])
          aggs.push(_this._aggregationInfo[var_id].current);
      });
      this.collection.options.data.agg = aggs;
    }

    this.collection.fetch({
      reset:true,
      data: requestData
    });
  },

  _hoverLegend: function(element) {
    var realKey = $(element.target).closest("div").attr("id");
    var allLinesPaths = d3.selectAll(this.$('g[key] > path'));
    allLinesPaths.classed('out',!allLinesPaths.classed('out'));

    var hoverLine = d3.selectAll(this.$('g[key="' + realKey + '"] > path'));
    hoverLine.classed('in',!hoverLine.classed('in')).classed('out',false);    
  },

  _hoverCircle: function(element) {
    var realKey = $(element.target).parent().attr("key");
    var allLinesPaths = d3.selectAll(this.$('g[key] > path'));
    allLinesPaths.classed('out',!allLinesPaths.classed('out'));

    var hoverLine = d3.selectAll(this.$('g[key="' + realKey + '"] > path'));
    hoverLine.classed('in',!hoverLine.classed('in')).classed('out',false);    
  },

  _hoverOut: function() {
    d3.selectAll(this.$('g[key] > path'))
      .classed('in',false)
      .classed('out',false);
  }
});
