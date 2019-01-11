var deps = {};
var src = 'src/verticals/maintenance/';
var srcJS = src + 'js/';
var public = 'verticals/maintenance/';

deps.templateFolder = [
  srcJS + 'template'
];

deps.JS = [
  srcJS + 'Namespace.js',
  srcJS + 'Metadata.js',
  srcJS + 'View/Panels/Maintenance/MaintenanceMasterPanelView.js',
];

deps.lessFile = [ src + 'css/styles.less' ];

deps.extraResources = [
  { srcFolder: src + 'public/img', dstFolder: public + 'img', onDebugIgnore: false },
];

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
