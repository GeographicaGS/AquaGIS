'use strict';

App.View.Widgets.Aq_cons.FlowSectorRanking = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Sectores con mayor caudal'),
      timeMode:'now',
      id_category: 'transport',
      publishable: true,
      classname: 'App.View.Widgets.Aq_cons.FlowSectorRanking'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    if(!this.hasPermissions()) return;

    this.collection = new App.Collection.Variables.Ranking(null,{
      id_scope : options.id_scope,
      data: {
        vars: [
          'aq_cons.sector.name',
          'aq_cons.sector.flow'
        ],
        var_order: 'aq_cons.sector.flow',
        order: 'desc',
        limit: 5
      },
      mode: 'now'
    });

    var _this = this;
    var tableModel = new Backbone.Model({
      css_class: 'transparent rankingWidget flow',
      csv:false,
      columns_format:{
        name: {
          css_class:'counter ellipsis',
        },
        flow:{
          title: App.mv().getVariable('aq_cons.sector.flow').get('units'),
          formatFN: function(d) {
          
            var max = _this.collection.at(0).get('flow'),
              width = d*100/max,
              d = App.nbf(d),
              template = _.template('<div class="flow"><div class="rankingBar"><div style="width:<%=width%>%"></div></div><span><%=d%></span></div>');
            return template({width: width, d: d});
          }
        },
      }
    });

    this.subviews.push(new App.View.Widgets.Table({
      model: tableModel,
      data: this.collection,
      listenContext: false
    }));

    this.filterables = [this.collection];
  }
});
