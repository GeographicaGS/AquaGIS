'use strict';

App.View.Widgets.Aq_cons.AlertsWidget = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title: __('Intensidad del tráfico'),
      timeMode:'now',
      id_category: 'aq_cons',
      dimension: 'allWidth strech bgWhite',
      publishable: true,
      classname: 'App.View.Widgets.Aq_cons.AlertsWidget'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);
    

    this.subviews.push(new App.View.Widgets.AlertsVariable({
      
    }));

  },
});