
var App = App || {};

var baseURL = 'urbo-aquagis-backend.geographica.gs/api'

App.config = {
  'api_url' : 'https://' + baseURL,
  'ws_url' : 'wss://' + baseURL + '/',
  'map_position':[36.7196718,4.4167761],
  'layout' : 'aquagis',
  'layout_header': 'aquagis_header_template',
  'layout_footer': 'aquagis_footer_template',
  'map_zoom':17,
  'maps_prefix':  'production_',
  'log': false,
  'title': 'AquaGIS'
};
