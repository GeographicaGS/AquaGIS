var deps = {};
var src = 'src/verticals/aquasig-theme/';
var srcJS = src + 'js/';
var public = 'verticals/aquasig-theme/';

deps.templateFolder = [srcJS + 'template'];
deps.JS = [
  srcJS + 'AppOverride.js',
  srcJS + 'Router.js'
];

deps.lessFile = [ src + 'css/styles.less' ];

deps.extraResources = [
  { srcFolder: src + 'public/img', dstFolder: public + 'img', onDebugIgnore: false },
  { srcFolder: src + 'public/mapstyle', dstFolder: public + 'mapstyle', onDebugIgnore: false }
]

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
