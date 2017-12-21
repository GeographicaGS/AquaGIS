var deps = {};
var src = 'src/verticals/aq_cons/';
var srcJS = src + 'js/';
var public = 'verticals/aq_cons/';

deps.templateFolder = [srcJS + 'template'];

deps.JS = [
  srcJS + 'Namespace.js',
  srcJS + 'Metadata.js',
  srcJS + 'Collection/AQCons.js',
  srcJS + 'Model/AQConsModel.js',
  srcJS + 'View/Panels/AQCons/AQConsPrevPanelView.js',
  srcJS + 'View/Panels/AQCons/AQConsMasterPanelView.js',
];

deps.lessFile = [ src + 'css/styles.less' ];

deps.extraResources = [
  { srcFolder: src + 'public/img', dstFolder: public + 'img', onDebugIgnore: false }
]

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
