// Copyright 2017 Telefónica Digital España S.L.
// 
// This file is part of UrboCore WWW.
// 
// UrboCore WWW is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// UrboCore WWW is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with UrboCore WWW. If not, see http://www.gnu.org/licenses/.
// 
// For those usages not covered by this license please contact with
// iot_support at tid dot es


App.View.Widgets.Aq_cons.AlertsVariable = Backbone.View.extend({

  _template: _.template( $('#AQCons-widgets-widget_alerts_variable_template').html()),

  initialize: function(options) {
    this.options = options;
    this.variables = options.variables;
  },
  
  render:function() {
    var _this = this;
    this.collection.fetch({
      data: this.options.searchParams,
      success: function(response) {
        
        var responseData = response.toJSON()[0];
        var items = [{ label: "saving", data: responseData.saving }];
        if (responseData.emergency) {
          items.unshift({ label: "emergency", data: responseData.emergency})
        }

        _.each(responseData.activations, (el) => {
          el.start = moment(el.start).format('HH:mm');
          el.finish = moment(el.finish).format('HH:mm');
        });

        _this.$el.closest(".widget").find('div.widget_header.' + items[0].label).removeClass("hide");
        _this.$el.html(_this._template({ items: items, activations: responseData.activations, variables: _this.variables, options: _this.options}));          
      }
    });
    return this;
  }
});
