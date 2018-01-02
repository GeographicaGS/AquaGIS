'use strict';

App.View.Panels.AQCons.Master = App.View.Panels.Base.extend({
  initialize: function(options) {

    options = _.defaults(options, {
      dateView: true,
      id_category: 'aq_cons',
      spatialFilter: false,
      master: true,
      title: __('Estado General'),
      id_panel: 'master'
    });

    App.View.Panels.Base.prototype.initialize.call(this,options);
    this.render();
  },

  customRender: function(){
    //this._widgets = [];
    //
    //
    // //CONTENEDORES EN PELIGRO DE DESBORDAMIENTO
    // this._widgets.push(new App.View.Widgets.Dumps.ContainerOverflow({
    //   id_scope: this.scopeModel.get('id'),
    //   link: '/' + this.scopeModel.get('id') + '/dumps/dashboard/dumps',
    // }));

  }
});
