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
  srcJS + 'View/Panels/AQSimul/AQSimulFutureConsumption.js',

  // VIEWS - MAPS
  srcJS + 'View/Map/AQSimulMapboxGLPopup.js',
  srcJS + 'View/Map/AQSimulRatesMap.js',
  srcJS + 'View/Map/AQSimulFutureConsumptionMap.js',
  srcJS + 'View/Map/Layer/AQSimulGeoJSONLayer.js',
  srcJS + 'View/Map/Layer/AQSimulPlotsLayers.js',
  srcJS + 'View/Map/Layer/AQSimulFutureConsumptionLayer.js',

  // WIDGETS
  srcJS + 'View/Widgets/ScenarioContainerView.js',
  srcJS + 'View/Widgets/WaterUseTypes.js',
  srcJS + 'View/Widgets/WaterTotalConsumption.js',
  srcJS + 'View/Widgets/D3BarsLine.js'

];

deps.lessFile = [ src + 'css/styles.less' ];

deps.extraResources = [
  { srcFolder: src + 'public/img', dstFolder: public + 'img', onDebugIgnore: false },
];

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
