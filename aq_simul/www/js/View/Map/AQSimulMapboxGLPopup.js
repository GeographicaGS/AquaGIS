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

'use strict';

App.View.Map.AQSimulMapboxGLPopup = Backbone.View.extend({
  initialize: function(template) {
    this._template = _.template($(template).html());
  },

  bindData: function(label, properties, clicked, deviceViewLink = false) {
    return this._template(
      _.extend({
        'name': label,
        'loading': false,
        'deviceViewLink': deviceViewLink
      }, properties));
  },

  drawTemplate: function(label, properties, clicked, popup, deviceViewLink = false) {
    if (typeof properties === 'function') {
      setTimeout(function() {
        properties = properties(clicked, popup, this)
      }.bind(this),500);
      return this._template({
        'name': label,
        'properties': [],
        'loading': true,
        'deviceViewLink': deviceViewLink
      });
    } else {
      return this.bindData(label, properties, clicked, deviceViewLink);
    }

  }
});
