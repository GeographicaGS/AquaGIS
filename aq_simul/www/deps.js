var deps = {};
var src = 'src/verticals/aq_simul/';
var srcJS = src + 'js/';
var public = 'verticals/aq_simul/';

deps.templateFolder = [
  srcJS + 'template'
];

deps.JS = [
  srcJS + 'Namespace.js',
  srcJS + 'Metadata.js',
  srcJS + 'Collection/AQSimulCollection.js',

  // MODELS
  srcJS + 'Model/AQSimulModel.js',

  // VIEWS - PANELS
  srcJS + 'View/Panels/AQSimul/AQSimulMasterPanelView.js',
  srcJS + 'View/Panels/AQSimul/AQSimulRates.js',

  // VIEWS - MAPS
  srcJS + 'View/Map/AQSimulMapboxGLPopup.js',
  srcJS + 'View/Map/AQSimulRatesMap.js',
  srcJS + 'View/Map/Layer/AQSimulGeoJSONLayer.js',
  srcJS + 'View/Map/Layer/AQSimulPlotsLayers.js'
];

deps.lessFile = [ src + 'css/styles.less' ];

deps.extraResources = [
  { srcFolder: src + 'public/img', dstFolder: public + 'img', onDebugIgnore: false },
];

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
