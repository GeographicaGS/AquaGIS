var deps = {};
var src = 'src/verticals/aq_cons/';
var srcJS = src + 'js/';
var public = 'verticals/aq_cons/';

deps.templateFolder = [
  srcJS + 'template'
];

deps.JS = [
  srcJS + 'Namespace.js',
  srcJS + 'Collection/AQConsCollection.js',
  srcJS + 'Model/AQConsModel.js',
  srcJS + 'View/Map/AQConsCurrentMap.js',
  srcJS + 'View/Map/AQConsGroupLayers.js',
  srcJS + 'View/Map/Layer/AQConsGeoJSONLayer.js',
  srcJS + 'View/Panels/AQCons/AQConsMasterPanelView.js',
  srcJS + 'View/Panels/AQCons/AQConsConsume.js',
  srcJS + 'View/Widgets/ConsumptionForecastByLandUse.js',
  srcJS + 'View/Widgets/ConsumptionForecastByLandUseTimeserie.js',
  srcJS + 'View/Widgets/WidgetTotalConsumeLastWeek.js',
  srcJS + 'View/Widgets/WidgetTotalConsumeWeeklyAverages.js'
];

deps.lessFile = [ src + 'css/styles.less' ];

deps.extraResources = [
  // { srcFolder: src + 'public/img', dstFolder: public + 'img', onDebugIgnore: false }
]

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
