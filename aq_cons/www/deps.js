var deps = {};
var src = 'src/verticals/aq_cons/';
var srcJS = src + 'js/';
var public = 'verticals/aq_cons/';

deps.templateFolder = [
  srcJS + 'template'
];

deps.JS = [
  srcJS + 'Namespace.js',
  srcJS + 'Metadata.js',
  srcJS + 'Collection/AQConsCollection.js',
  srcJS + 'Model/AQConsModel.js',
  srcJS + 'View/AQConsVariableSelector.js',
  srcJS + 'View/Map/AQConsCurrentMap.js',
  srcJS + 'View/Map/AQConsLeakMap.js',
  srcJS + 'View/Map/Layer/AQConsGroupLayers.js',
  srcJS + 'View/Map/Layer/AQConsSectorLeakLayers.js',
  srcJS + 'View/Map/Layer/AQConsGeoJSONLayer.js',
  srcJS + 'View/Panels/AQCons/AQConsMasterPanelView.js',
  srcJS + 'View/Panels/AQCons/AQConsForecast.js',
  srcJS + 'View/Panels/AQCons/AQConsHistoric.js',
  srcJS + 'View/Panels/AQCons/AQConsLeak.js',
  srcJS + 'View/Widgets/ConsumptionForecastByLandUse.js',
  srcJS + 'View/Widgets/ConsumptionForecastByLandUseTimeserie.js',
  srcJS + 'View/Widgets/FlowEvolution.js',  
  srcJS + 'View/Widgets/PressureEvolution.js',  
  srcJS + 'View/Widgets/FlowSectorRanking.js',
  srcJS + 'View/Widgets/PressureSectorRanking.js',
  srcJS + 'View/Widgets/WidgetTotalConsumeLastWeek.js',
  srcJS + 'View/Widgets/WidgetTotalConsumeWeeklyAverages.js'
];

deps.lessFile = [ src + 'css/styles.less' ];

deps.extraResources = [
  { srcFolder: src + 'public/img', dstFolder: public + 'img', onDebugIgnore: false },
];

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
