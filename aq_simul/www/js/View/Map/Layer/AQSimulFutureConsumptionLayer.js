
App.View.Map.Layer.Aq_simul.FutureConsumptionLayer = Backbone.View.extend({

  iconsFolder: '/verticals/aquasig-theme/img/icons/map',

  initialize: function(options, payload, map) {
    this._payload = payload;
    
    // Modelos
    let plot = new App.Model.Aq_simul.Model({scope: options.scope, type: options.type, entity: 'aq_cons.plot'});
    let plotPayload = JSON.parse(JSON.stringify(this._payload));

    plotPayload.var = plotPayload.var.replace(/(.*\.).*(\..*)/,'$1plot$2');  
    
    this._plotLayer = new App.View.Map.Layer.Aq_simul.GeoJSONLayer({
      source: {
        id: 'aqua_plots',
        model: plot,
        payload: plotPayload
      },
      layers:[
        {
          'id': 'plot_transparent',
          'type': 'fill',
          'source': 'aqua_plots',            
          'paint': {
          'fill-color': 'rgba(110, 186, 255, 0.2)',
          },
          
        }
      ],
      map: map
    })
  },
  onClose: function() {
    this._plotLayer.close();
  }
});
