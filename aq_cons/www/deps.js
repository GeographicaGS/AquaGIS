var deps = {};
var src = 'src/verticals/aq_cons/';
var srcJS = src + 'js/';
var public = 'verticals/aq_cons/';

deps.templateFolder = [
  // srcJS + 'template'
];

deps.JS = [
  srcJS + 'Namespace.js',
  srcJS + 'Collection/AQConsCollection.js',
  srcJS + 'Model/AQConsModel.js',
  srcJS + 'View/Map/AQConsCurrentMap.js',
  srcJS + 'View/Map/Layer/AQConsGenericLayer.js',
  srcJS + 'View/Map/Layer/ConnectionLayer.js',
  srcJS + 'View/Map/Layer/ConnectionLineLayer.js',
  srcJS + 'View/Map/Layer/HydrantLayer.js',
  srcJS + 'View/Map/Layer/HydrantLineLayer.js',
  srcJS + 'View/Map/Layer/PlotLayer.js',
  srcJS + 'View/Map/Layer/PlotStructureLayer.js',
  srcJS + 'View/Map/Layer/SectorLayer.js',
  srcJS + 'View/Map/Layer/SensorLayer.js',
  srcJS + 'View/Map/Layer/SupplyLayer.js',
  srcJS + 'View/Map/Layer/SupplyLineLayer.js',
  srcJS + 'View/Map/Layer/TankLayer.js',
  srcJS + 'View/Map/Layer/ValveLayer.js',
  srcJS + 'View/Map/Layer/ValveLineLayer.js',
  srcJS + 'View/Map/Layer/WellLayer.js',
  srcJS + 'View/Map/Layer/WellLineLayer.js',
  srcJS + 'View/Widgets/ConsumptionForesightByLandUse.js',
  srcJS + 'View/Panels/AQCons/AQConsMasterPanelView.js',
  srcJS + 'View/Panels/AQCons/AQConsConsume.js',
  srcJS + 'View/Widgets/WidgetTotalConsumeLastWeek.js'
];

deps.lessFile = [ src + 'css/styles.less' ];

deps.extraResources = [
  // { srcFolder: src + 'public/img', dstFolder: public + 'img', onDebugIgnore: false }
]

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
