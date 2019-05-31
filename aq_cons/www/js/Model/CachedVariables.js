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

App.Model.CachedVariables = Backbone.Model.extend({

  // name variable in LocalStorage
  variablesInLocalStorage: 'cachedVariables',

  // Defaults data in model
  defaults: {
    variables: {},
  },

  initialize: function (attributes, options) {

    Backbone.Model.prototype.initialize.call(this, [attributes, options]);

    debugger;

    // var dataToLocalStorage = JSON.parse(localStorage.getItem('context')) || {};

    // // Check if is local (not global) to avoid loading default dates and check if start or finish dates are set
    // if (!(attributes && attributes.local || attributes && attributes.start && attributes.finish)) {
    //   // Set "time" attributes
    //   dataToLocalStorage.start = dataToLocalStorage.start
    //     ? moment.utc(dataToLocalStorage.start)
    //     : moment().subtract(7, 'days').utc();

    //   dataToLocalStorage.finish = dataToLocalStorage.finish
    //     ? moment.utc(dataToLocalStorage.finish)
    //     : moment().utc();
    // }

    // // Save initial data in model
    // this.set(dataToLocalStorage);

    // // Check if is local (not global) to avoid saving changes as default dates
    // if (!(attributes && attributes.local)) {
    //   this.on('change', this.setInLocalStorage);
    // }
  },

  /**
   * get the variables from "localStorage"
   * 
   * @returns {Object} varible to get
   */
  getFromLocalStorage: function () {
    return localStorage.getItem(this.variablesInLocalStorage) || {};
  },

  /**
   * Save the variables in "localStorage"
   * 
   * @returns {Boolean} ¿save the variable?
   */
  setInLocalStorage: function () {
    return localStorage.setItem(this.variablesInLocalStorage, JSON.stringify(this.toJSON()));
  },

  /**
   * Get variable from cache
   * 
   * @param {String} variable - variable to get
   * @param {Object} findOptions - find options
   * @returns {Object|Boolean} - variable
   */
  getCachedVariable: function (variable, findOptions) {
    var cachedVariables = this.get('variables');
    var currentVariable = cachedVariables[variable];

    if (!currentVariable || currentVariable.expireTime.isAfter(moment())) return false;

    if (Array.isArray(currentVariable.data) && findOptions) {
      return _.find(currentVariable.data, function (item) {
        return _.every(findOptions, function(value, key) {
          return item[key] === value;
        });
      }) || false;
    }

    return currentVariable.data;
  },

  /**
   * Set source to the model
   * 
   * @param {String} variable - variable to set
   * @param {Object} data - data to save
   * @param {Boolean} reset - "true" => reset the array
   * , "false" => new item in array
   * @returns {Boolean} ¿save the variable?
   */
  setCachedVariable: function (variable, data, reset) {
    // Default is TRUE
    reset = typeof reset === 'undefined'
      ? true
      : reset;

    var cachedVariables = this.get('variables');
    var currentVariable = cachedVariables
      ? cachedVariables[variable]
      : false;
    var variableData = {
      expireTime: moment().add(3600, 'seconds')
    };

    if (currentVariable) {
      // Is array
      if (Array.isArray(currentVariable.data) && !reset) {
        var cloneItems = _.clone(cachedVariables[variable].data);
        // // Clone current maps array
        // var cloneSources = _.clone(this.get('mapSources'));
        // // Get current cached map (index)
        // var currentMapIndex = cloneSources.findIndex(function (source) {
        //   return source.id === options.id &&
        //     source.scope === options.scope;
        // });

        // // Remove from array
        // if (currentMapIndex > -1) {
        //   cloneSources.splice(currentMapIndex, 1);
        // }

        // cloneSources.push(variableData);
        // this.set('mapSources', cloneSources);
      } else {
        _.extend(cachedVariables[variable], variableData, { data: data });
      }
      this.set('variables', cachedVariables);
    }

    return false;
  },

});

/**
 * Create the new global variable and the variables that we want save
 */
App.cachedVariables = new App.Model.CachedVariables({
  variables: {
    sourceLayers: {
      saveInLocalStorage: false,
      expireTime: null,
      data: []
    }
  }
});
