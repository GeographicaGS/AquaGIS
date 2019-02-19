
App.View.Map.Layer.Aq_simul.PlotsLayer = Backbone.View.extend({
  iconsFolder: '/verticals/aquasig-theme/img/icons/map',

  initialize: function(options, payload, map) {
    this._payload = payload;
    this.activePlot = null;
    
    // Modelos
    let plot = new App.Model.Aq_simul.PlotsModel({scope: options.scope });    
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
          }
        },
        {
          'id': 'plot',
          'type': 'fill',
          'source': 'aqua_plots',
          'paint': {
            'fill-color': 'rgba(110, 186, 255, 0.4)',
          },
          'filter': ['==', 'id_entity', ''] 
        },
        {
          'id': 'plot_selected',
          'type': 'fill',
          'source': 'aqua_plots',
          'paint': {
            'fill-color': '#6EBAFF',
          },
          'filter': ['==', 'id_entity', ''] 
        },
      ],
      template: new App.View.Map.AQSimulMapboxGLPopup('#AQSimul-popups-rates_popup'),
      map: map
    })
    .setHoverable(true)
    .on('mousemove','plot_transparent', function(e) {
      if (this.activePlot !== e.features[0].properties.id_entity) {
        this.activePlot = e.features[0].properties.id_entity;
        map._map.setFilter('plot',['==', 'id_entity', e.features[0].properties.id_entity])
      }
    })
    .on('click', 'plot_transparent', (e) => {
      const featuresHolder = {features: e.features};
      setTimeout(() => {
        map._map.setFilter('plot_selected',['==', 'id_entity', featuresHolder.features[0].properties.id_entity]);
      }, 100)
     
    })
    .setInteractivity(__('Tarificación'), (e, popup, _this) => {
      let tipo =  Number(e.features[0].properties['tipo']) === 1 ? 0 : 1;
      let data = {
        "idDistribuidora": 2132,
        "tipo": tipo,
        "calibre": e.features[0].properties['calibre'],
        "consumo": e.features[0].properties['consumption'], 
      }
      if (tipo === 0) {
        data.numeroHabitantes = e.features[0].properties['n_personas']
      }
      
      new App.Model.Aq_simul.RatesModel({
        scope: options.scope,
        entity: e.features[0].properties['id_entity']
      }).fetch({
        contentType: "application/json",
        data: data,
        success: function(response) {
          let templateData = {};
          if (response.attributes.codigo && response.attributes.codigo == 500) {
            templateData = {
              consumption: data.consumo,
              facturaParteFija : {
                general: 0,
                vertido: 0,
                depuracion: 0,
                autonomica: 0,
                total: 0
              },
              facturaParteVariable : {
                abastecimiento: 0,
                vertido: 0,
                depuracion: 0,
                canonLocal: 0,
                canonAutonomico: 0,
                total: 0
              },
              totalneto: 0,
              iva: 0,
              total: 0
            };
            
            let html = _this.bindData(__('Tarificación'),templateData,e);
            popup.setHTML(html);

          } else {
            templateData = response.attributes;
            templateData.consumption = data.consumo;
            let html = _this.bindData(__('Tarificación'),templateData,e);
            popup.setHTML(html);
          }
          
        }
      });

      popup.on('close', () => {
        map._map.setFilter('plot_selected',['==', 'id_entity', '']);
        map._map.setFilter('plot',['==', 'id_entity', '']);
      })

    });
  },
  onClose: function() {
    this._plotLayer.close();
  }
});
