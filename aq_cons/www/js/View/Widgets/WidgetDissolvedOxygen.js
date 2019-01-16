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

App.View.Widgets.Aq_cons.DissolvedOxygen = App.View.Widgets.Base.extend({

  initialize: function(options) {
    options = _.defaults(options,{
      title:__('Oxígeno disuelto'),
      timeMode: 'now',
      id_category: 'aq_cons'
    });
    App.View.Widgets.Base.prototype.initialize.call(this,options);

    var collection = new App.Collection.Post([], {
      id_scope: options.id_scope,
      data: {}
    })

    collection.url = App.config.api_url + '/' + options.id_scope + '/traffic/people/ranking/now';

    var tableModel = new Backbone.Model({
      css_class: 'transparent rankingWidget dissolvedOxygen',
      csv:false,
      columns_format:{
        name: {
          css_class:'counter ellipsis',
        },
        people:{
          title: __('Población'),
          formatFN: function(d) {

            console.log(d);

            var max = collection.at(0).get('people'),
              width = d*100/max,
              template = _.template('<div class="intensity"><div class="rankingBar"><div style="width:<%=width%>%"></div></div><span><%=App.nbf(d, {decimals: 0})%></span></div>');
            return template({width: width, d: d});
          }
        }
      }

    });

    this.subviews.push(new App.View.Widgets.Table({
      model: tableModel,
      data: collection,
      listenContext: false
    }));

    this.filterables = [collection];
  }
});
