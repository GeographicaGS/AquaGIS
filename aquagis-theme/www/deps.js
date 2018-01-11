var deps = {};
var src = 'src/verticals/aquagis-theme/';
var srcJS = src + 'js/';
var public = 'verticals/aquagis-theme/';

deps.templateFolder = [srcJS + 'template'];
deps.JS = []

deps.lessFile = [ src + 'css/styles.less' ];

deps.extraResources = [
  { srcFolder: src + 'public/img', dstFolder: public + 'img', onDebugIgnore: false },
  { srcFolder: src + 'public/mapstyle', dstFolder: public + 'mapstyle', onDebugIgnore: false }
]

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
