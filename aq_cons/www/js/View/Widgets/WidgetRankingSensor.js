// Copyright 2017 Telefónica Digital España S.L.
//
// PROJECT: urbo-telefonica
//
// This software and / or computer program has been developed by
// Telefónica Digital España S.L. (hereinafter Telefónica Digital) and is protected as
// copyright by the applicable legislation on intellectual property.
//
// It belongs to Telefónica Digital, and / or its licensors, the exclusive rights of
// reproduction, distribution, public communication and transformation, and any economic
// right on it, all without prejudice of the moral rights of the authors mentioned above.
// It is expressly forbidden to decompile, disassemble, reverse engineer, sublicense or
// otherwise transmit by any means, translate or create derivative works of the software and
// / or computer programs, and perform with respect to all or part of such programs, any
// type of exploitation.
//
// Any use of all or part of the software and / or computer program will require the
// express written consent of Telefónica Digital. In all cases, it will be necessary to make
// an express reference to Telefónica Digital ownership in the software and / or computer
// program.
//
// Non-fulfillment of the provisions set forth herein and, in general, any violation of
// the peaceful possession and ownership of these rights will be prosecuted by the means
// provided in both Spanish and international law. Telefónica Digital reserves any civil or
// criminal actions it may exercise to protect its rights.

'use strict';

App.View.Widgets.Aq_cons.RankingSensor = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options, {
      // Default filters to server request
      data: {
        filters: {
          condition: {},
          conditions: {}
        }
      },
      entity: 'aq_cons.sensor',
      id_scope: null,
      property_unit: 'unts.',
      sensor_property: null,
      timeMode: 'now',
      title: null
    });

    // Return "Void"
    if (!options.id_scope || !options.sensor_property) {
      return;
    }

    // Init widget
    App.View.Widgets.Base.prototype.initialize.call(this,
      { 
        title: options.title,
        timeMode: options.timeMode
      }
    );

    // Data collection to table
    var collection = new App.Collection.Post([], { data: options.data })
    // Request Url
    collection.url = 
      App.config.api_url.concat(
        '/', options.id_scope, '/maps/', options.entity, '/', options.timeMode
      );
    // Parse response data
    collection.parse = function(response) {
      return response.features
        .map(function(item) {
          return {
            name: item.properties.name,
            [options.sensor_property]: item.properties[options.sensor_property]
          }
        })
        // Descending order 
        .sort(function(a, b) {
          return b[options.sensor_property]-a[options.sensor_property];
        })
    }

    // Create table
    var tableModel = new Backbone.Model({
      css_class: 'transparent rankingWidget ' + options.sensor_property,
      csv: false,
      columns_format:{
        // Table Fields
        name: {
          title: __('Nombre'),
          css_class:'counter ellipsis',
        },
        [options.sensor_property]: {
          title: options.property_unit,
          formatFN: function(d) {
            var max = collection.at(0).get(options.sensor_property);
            var width = d*100/max;
            var template = _.template(
              '<div class="rankingValue">\
                <div class="rankingBar">\
                  <div style="width:<%=width%>%"></div>\
                </div>\
                <span><%=App.nbf(d, {decimals: 2})%></span>\
              </div>'
            );

            return template({
              width: width,
              d: d + options.property_unit
            });
          }
        }
      }

    });

    // Add to widget content the table
    this.subviews.push(new App.View.Widgets.Table({
      model: tableModel,
      data: collection,
      listenContext: false
    }));

    this.filterables = [collection];
  }
});
