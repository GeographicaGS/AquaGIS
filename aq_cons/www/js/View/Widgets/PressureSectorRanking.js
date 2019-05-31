'use strict';

App.View.Widgets.Aq_cons.PressureSectorRanking = App.View.Widgets.Base.extend({
  
  initialize: function (options) {
    options = _.defaults(options, {
      title: __('Sectores con mayor presión'),
      timeMode: 'now',
      id_category: 'aq_cons',
      publishable: true,
      classname: 'App.View.Widgets.Aq_cons.PressureSectorRanking'
    });
  
    App.View.Widgets.Base.prototype.initialize.call(this, options);
  
    if (!this.hasPermissions()) return;

    // Collection table
    this.tableCollection = this.getTableCollection();
    this.subviews.push(new App.View.Widgets.Table({
      model: this.getTableSetup(),
      data: this.tableCollection,
      listenContext: false
    }));
  },

  /**
 * Get the data (collection) that we will uses
 * to show in the table
 * 
 * @return {Object} - Backbone.Collection
 */
  getTableCollection: function () {
    var dataCollection = new Backbone.Collection(null);

    // Custom fetch method
    dataCollection.fetch = _.bind(this.fetchTableCollection, this);

    // Is neccesary to the table widget
    dataCollection.options = {
      data: {}
    };

    // Custom parse method
    dataCollection.parse = _.bind(this.parseTableCollection, this);

    return dataCollection;
  },

  /**
   * Custom fetch function to the collection
   * 
   * @param {Object} options - differents options to request
   * @returns {Promise} promise
   */
  fetchTableCollection: function (options) {
    return $.when(this.getRankingDataNow(), this.getRankingDataHistoric())
      .done(function () {
        this.tableCollection.reset(this.tableCollection.parse(arguments));
      }.bind(this));
  },

  /**
   * Parse data differents requests
   * 
   * @param {Object} response - differents request response
   * @returns {Object} parse response collection
   */
  parseTableCollection: function (response) {
    var dataNow = response[0];
    var dataHistoric = response[1];

    return _.map(dataHistoric, function (historic) {
      var currentDataNow = _.find(dataNow, function (now) {
        return historic.id_entity === now.id_entity;
      });

      if (currentDataNow && currentDataNow.name) {
        historic.name = currentDataNow.name;
      } else {
        historic.name = __('Sin nombre');
      }
      return historic;
    });
  },

  /**
   * Get the collection used by the table
   * 
   * @returns {Promise} request promise
   */
  getRankingDataNow: function () {
    var def = $.Deferred(); // This is like a "Promise"
    var collection = new App.Collection.Variables.Ranking(null, {
      id_scope: this.options.id_scope,
      data: {
        vars: [
          'aq_cons.sector.name',
          'aq_cons.sector.pressure'
        ],
        var_order: 'aq_cons.sector.pressure',
        order: 'desc',
        limit: 5,
      },
      mode: 'now'
    });

    // We launch the request
    collection.fetch({
      success: function () {
        // Resolve deferred
        def.resolve(arguments[1]);
      }
    });

    return def.promise();
  },

  /**
   * Get data about historic ranking
   * 
   * @returns {Promise} request promise
   */
  getRankingDataHistoric: function () {
    var def = $.Deferred(); // This is like a "Promise"
    var collection = new App.Collection.Variables.Ranking(null, {
      id_scope: this.options.id_scope,
      data: {
        agg: ['SUM'],
        vars: [
          'aq_cons.sector.pressure'
        ],
        var_order: 'aq_cons.sector.pressure',
        order: 'desc',
        limit: 5,
        time: {
          start: moment().startOf('hour').subtract(2, 'hour').toDate(),
          finish: moment().startOf('hour').subtract(1, 'hour').toDate()
        }
      },
      mode: 'historic'
    });

    // We launch the request
    collection.fetch({
      success: function () {
        // Resolve deferred
        def.resolve(arguments[1]);
      }
    });

    return def.promise();
  },

  /**
   * Set the differents options to setup the ranking table
   * 
   * @returns {Object} options to draw the table
   */
  getTableSetup: function () {
    return new Backbone.Model({
      css_class: 'transparent rankingWidget pressure',
      csv: false,
      columns_format: {
        name: {
          css_class: 'counter ellipsis',
        },
        pressure: {
          title: App.mv().getVariable('aq_cons.sector.pressure').get('units'),
          formatFN: function (value) {
            // Draw progress bar
            var max = _.reduce(this.tableCollection.toJSON(), function (sumMax, model) {
              sumMax = model.pressure > sumMax
                ? model.pressure
                : sumMax;
              return sumMax;
            }, 0);
            var width = value * 100 / max;
            var template = _.template('\
              <div class="pressure">\
                <div class="rankingBar">\
                  <div style="width:<%=width%>%"></div>\
                </div>\
                <span class="value"><%=value%></span>\
              </div>\
            ');

            return template({
              width: width,
              value: Number.parseInt(value, 10)
            });
          }.bind(this)
        },
      }
    });
  }

});
