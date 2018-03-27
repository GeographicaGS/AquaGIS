
var App = App || {};

var baseURL = 'urbo-aquagis-backend.geographica.gs/api'

App.config = {
  'api_url' : 'https://' + baseURL,
  'ws_url' : 'wss://' + baseURL + '/',
  'map_position':[36.7196718,4.4167761],
  'layout' : 'aquasig',
  'layout_header': 'aquasig_header_template',
  'layout_footer': 'aquasig_footer_template',
  'map_zoom':17,
  'maps_prefix':  'production_',
  'log': false,
  'title': 'AquaSIG',
  'pathFavicon': '/verticals/aquasig-theme',  
};
