'use strict';

App.View.Widgets.Aq_simul.D3BarsLineCustom = App.View.Widgets.Charts.D3.BarsLine.extend({
  _template: _.template( $('#AQSimul-chart-future-consumption').html() ),
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

    this.setElement(this._template({
      'm': this.options.toJSON()
    }));

    this.$el.append(App.widgetLoading());

    try{
      this._fetchData();
    }catch(e){

      this._drawChart();
    }

    return this;
  },

  _drawElements: function() {
    var alertData = _.find(this.data, function(data) {
      return data.type === 'alert';
    });
    if (alertData) {
      this._drawArea(alertData);
    }
    App.View.Widgets.Charts.D3.BarsLine.prototype._drawElements.call(this);
  },
  

  _fetchData: function(){
    var requestData = this.collection.options.data;

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
      reset: true,
      data: requestData,
    })
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
  },

  _drawArea: function(data) {
    var _this = this;
    this._tmpAreaData = data.values;
    var areaGroup = this._chart.svg.append('g')
      .append('g')
      .attr('class', 'areagroup')
      .selectAll('line')
      .data(this._tmpAreaData)
      .enter();
    this._chart.areaGroup = this._chart.areaGroup || [];

    areaGroup
    .append('line')
    .attr('x1', function(d,idx) {
      return _this.xScaleLine(idx)
    })
    .attr('x2', function(d,idx) {
      return _this.xScaleLine(idx)
    })
    .attr('y1', 0)
    .attr('y2', function(d, idx) {
      if (d.y === 2 ) {
        // if d.y is leak 
        if (_this._tmpAreaData[idx - 1] === undefined || _this._tmpAreaData[idx - 1].y !== 2) {
          // if prev.y is not leak or not prev draw red line
          return _this.yScales[0](_this.yAxisDomain[0][0])
        } else if (_this._tmpAreaData[idx - 1].y === 2) {
          // if prev is leak nothing to do here. ONLY AREA
        }
      } else {
        // if current is not leak
        if (_this._tmpAreaData[idx - 1] !== undefined && _this._tmpAreaData[idx - 1].y === 2) {
          // if prev exists and is leak then draw line
          return _this.yScales[0](_this.yAxisDomain[0][0])
        } else {
          // nothing to do here
        }
          
      }

      return 0;
    })
    .attr('stroke-width','1px')
    .attr('stroke', function(d, idx) { return _this._getColor(this.__data__, idx); })    
    .style('stroke', '2');

    areaGroup.append('rect')
    .attr('x', function(d,idx) {
      return _this.xScaleLine(idx) + 1
    })
    .attr('y', 0)
    .attr('width',function(d, idx) {
      return _this.xScaleBars.rangeBand() + 4;
    })
    .attr('height',function(d, idx) {
      // Number '2' is leak
      if (d.y === 2 ) {
        // if d.y is leak 
        if (_this._tmpAreaData[idx - 1] === undefined || _this._tmpAreaData[idx - 1].y !== 2) {
          // if prev.y is not leak or not prev draw red line
          return _this.yScales[0](_this.yAxisDomain[0][0])
        } else if (_this._tmpAreaData[idx - 1].y === 2) {
          // ONLY AREA
          return _this.yScales[0](_this.yAxisDomain[0][0])          
        }
      } else {
        // Nothing to do here
      }
      return 0;
    })
    .attr('fill',function(d, idx) { return _this._getColor(this.__data__, idx); })
    .attr('fill-opacity',0.2)

    this._chart.areaGroup.push(areaGroup);
    
  },

  _drawTooltip: function(d, serie, index, _this){
    var $tooltip = this.$('#chart_tooltip');
    if(!$tooltip.length){
      $tooltip = $('<div id="chart_tooltip" class="hidden"></div>');
      this.$el.append($tooltip);
    }
    var data = {
      value: d.x,
      series: []
    };

    if (this.options.get('originalTooltip')) {
      var that = this;
      this.data.forEach(function(el){
        if(!that._internalData.disabledList[el.realKey] && el.type !== 'alert'){
          data.series.push({
            value: el.values[serie].y,
            key: el.key,
            realKey: el.realKey,
            color: that._getColor(el, serie),
            cssClass: that.options.has('classes') ? that.options.get('classes')(el): '',
            yAxisFunction: that.options.get('yAxisFunction')[el.yAxis - 1]
          });
        }
      });
    } else {
      var key = d3.select(_this.parentNode).attr('key');
      var dataHover = _.find(this.data, function(el){
        return el.realKey === key;
      });
  
      data.series.push({
        value: dataHover.values[serie].y,
        key: dataHover.key,
        realKey: dataHover.realKey,
        color: this._getColor(dataHover, serie),
        cssClass: this.options.has('classes') ? this.options.get('classes')(dataHover): '',
        yAxisFunction: this.options.get('yAxisFunction')[dataHover.yAxis - 1]
      });
    }
  
    $tooltip.html(this._template_tooltip({
      data: data,
      utils: {
        xAxisFunction: this.xAxisFunction
      }
    }));
    var cursorPos = d3.mouse(_this);
    $tooltip.css({
      position: 'absolute',
      top: cursorPos[1],
      left: cursorPos[0]
    });

    $tooltip.removeClass('hidden');
  }

});
