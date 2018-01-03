'use strict';

App.View.Panels.AQCons.Master = App.View.Panels.Base.extend({
  _mapInstance: null,
  _basemapSelectorTemplate: `
    <select class="basemapselector" id="basemapselector">
      <option value="positron">Positron</option>
      <option value="dark">Dark</option>
    </select>
  `,
  initialize: function(options) {

    options = _.defaults(options, {
      dateView: true,
      id_category: 'aq_cons',
      spatialFilter: false,
      master: true,
      title: __('Estado General'),
      id_panel: 'master'
    });

    let optionsMap = {
      defaultBasemap: 'positron',
      center: [-6.0738382,37.3357641]
    }

    App.View.Panels.Base.prototype.initialize.call(this,options);
    this._mapInstance = new App.View.Map.AQCons.MapView(optionsMap);
    this.render();
  },

  render: function() {
    this.subviews.push(this._mapInstance);
    App.View.Panels.Base.prototype.render.call(this);  
    this.$el.append(this._basemapSelectorTemplate);
    this.$el.on('change','#basemapselector', (e) => {
      let next = document.getElementById("basemapselector").value;
      this._mapInstance.changeBasemap(next);
    })
  },
});
