const fs = require('fs');
const path = require('path');

const clone = (x) => {
  return JSON.parse(JSON.stringify(x));
};

const range = (x) => {
  return Array(Number.parseInt(x)).fill();
};

const saveJSONFile = (outputFile, data) => {
  fs.writeFileSync(outputFile, `${ JSON.stringify(data, null, '  ') }\n`);
};

const capitalizeFirst = (x) => {
  return x.charAt(0).toUpperCase() + x.substring(1);
};

const factorizeInterpolator = (protoInterpolator, factor) => {
  let interpolator = '';
  let re = /([0-9\.]+\,[0-9\.]+)/g;
  let reResult;
  let i = 0;

  while ((reResults = re.exec(protoInterpolator)) !== null) {
    let values = reResults[0].split(',');
    values = values.map((x) => {
      return Number.parseFloat(x) * factor;
    });
    values = `${ values[0] },${ values[1] }`;

    interpolator = `${ interpolator }${ protoInterpolator.substring(i, reResults.index) }${values}`;
    i = re.lastIndex;
  }

  interpolator = `${ interpolator }${ protoInterpolator.substring(i, protoInterpolator.length) }`;
  return interpolator;
};

const getExports = (protoExport, exportStrings) => {
  let exportsObject = clone(protoExport)

  exportsObject.flowIndustrialSmallWeek = exportStrings.interpolators.flow.industrialWeek;
  exportsObject.flowIndustrialSmallWeekend = exportStrings.interpolators.flow.industrialWeekend;

  exportsObject.flowIndustrialLargeWeek = factorizeInterpolator(exportStrings.interpolators.flow.industrialWeek, exportStrings.interpolatorFactors.industrialLarge);
  exportsObject.flowIndustrialLargeWeekend = factorizeInterpolator(exportStrings.interpolators.flow.industrialWeekend, exportStrings.interpolatorFactors.industrialLarge);

  exportsObject.flowComercialSmallWeek = exportStrings.interpolators.flow.comercialWeek;
  exportsObject.flowComercialSmallWeekend = exportStrings.interpolators.flow.comercialWeekend;

  exportsObject.flowComercialLargeWeek = factorizeInterpolator(exportStrings.interpolators.flow.comercialWeek, exportStrings.interpolatorFactors.comercialLarge);
  exportsObject.flowComercialLargeWeekend = factorizeInterpolator(exportStrings.interpolators.flow.comercialWeekend, exportStrings.interpolatorFactors.comercialLarge);

  exportsObject.flowDomesticSmallWeek = exportStrings.interpolators.flow.domesticWeek;
  exportsObject.flowDomesticSmallWeekend = exportStrings.interpolators.flow.domesticWeekend;

  exportsObject.flowDomesticMediumWeek = factorizeInterpolator(exportStrings.interpolators.flow.domesticWeek, exportStrings.interpolatorFactors.domesticMedium);
  exportsObject.flowDomesticMediumWeekend = factorizeInterpolator(exportStrings.interpolators.flow.domesticWeekend, exportStrings.interpolatorFactors.domesticMedium);

  exportsObject.flowDomesticLargeWeek = factorizeInterpolator(exportStrings.interpolators.flow.domesticWeek, exportStrings.interpolatorFactors.domesticLarge);
  exportsObject.flowDomesticLargeWeekend = factorizeInterpolator(exportStrings.interpolators.flow.domesticWeekend, exportStrings.interpolatorFactors.domesticLarge);

  exportsObject.pressureAnyUseAllWeek = exportStrings.interpolators.pressure.anyUseAllWeek;

  return exportsObject;
};

const getConstrId = (plotId, floor) => {
  return `construction_id:${ plotId.split(':')[1] }_${ floor }`;
};

const randomNoughToSixty = () => {
  return Math.floor((Math.random() * 59) + 1);
};

const randomQuarter = () => {
  let first = Math.floor((Math.random() * 14) + 1);
  return `${ first },${ first + 15 },${ first + 30 },${ first + 45 }`;
};

const replaceCronString = (protoSchedule, position, replace) => {
  let schedule = protoSchedule.split(' ');
  schedule[position] = replace;
  return schedule.join(' ');
};

const getConstrActive = (protoActive, usage, area, exportStrings) => {
  let theSecond = randomNoughToSixty();
  let theMinute = randomNoughToSixty();  // randomQuarter();
  let active = [];

  active.push(clone(protoActive[0]));
  active[0].schedule = replaceCronString(exportStrings.schedules.week, 0, theSecond);
  active[0].schedule = replaceCronString(active[0].schedule, 1, theMinute);

  active.push(clone(protoActive[0]));
  active[1].schedule = replaceCronString(exportStrings.schedules.weekend, 0, theSecond);
  active[1].schedule = replaceCronString(active[1].schedule, 1, theMinute);

  active.push(clone(protoActive[2]));
  active[2].value = 'import(pressureAnyUseAllWeek)';
  active[2].schedule = replaceCronString(exportStrings.schedules.week, 0, theSecond);
  active[2].schedule = replaceCronString(active[2].schedule, 1, theMinute);

  active.push(clone(protoActive[2]));
  active[3].value = 'import(pressureAnyUseAllWeek)';
  active[3].schedule = replaceCronString(exportStrings.schedules.weekend, 0, theSecond);
  active[3].schedule = replaceCronString(active[3].schedule, 1, theMinute);

  let size = null;
  if (usage === 'industrial') {
    size = area >= exportStrings.areaThresholds.indsutrialLarge ? 'Large' : 'Small';

  } else if (usage === 'comercial') {
    size = area >= exportStrings.areaThresholds.comercialLarge ? 'Large' : 'Small';

  } else {
    size = area >= exportStrings.areaThresholds.domesticLarge ? 'Large' : area >= exportStrings.areaThresholds.domesticMedium ? 'Medium' : 'Small';
  }

  active.push(clone(protoActive[1]));
  active[4].value = `import(flow${ capitalizeFirst(usage) }${ size }Week)`;
  active[4].schedule = replaceCronString(exportStrings.schedules.week, 0, theSecond);
  active[4].schedule = replaceCronString(active[4].schedule, 1, theMinute);

  active.push(clone(protoActive[1]));
  active[5].value = `import(flow${ capitalizeFirst(usage) }${ size }Weekend)`;
  active[5].schedule = replaceCronString(exportStrings.schedules.weekend, 0, theSecond);
  active[5].schedule = replaceCronString(active[5].schedule, 1, theMinute);

  return active;
};

const createPlot = (protoPlot, template) => {
  let plot = clone(template);

  plot.entity_name = protoPlot.properties.id;

  plot.staticAttributes[0].value = protoPlot.geometry;
  plot.staticAttributes[1].value = protoPlot.properties.refSector;
  plot.staticAttributes[2].value = protoPlot.properties.description;
  plot.staticAttributes[3].value = `${ protoPlot.properties.area }`;
  plot.staticAttributes[4].value = `${ protoPlot.properties.floors }`;

  return plot;
};

const createConstr = (protoPlot, floor, template, exportStrings) => {
  let constr = clone(template);

  constr.entity_name = getConstrId(protoPlot.properties.id, floor);

  constr.staticAttributes[0].value = protoPlot.properties.centroid;
  constr.staticAttributes[1].value = protoPlot.properties.refSector;
  constr.staticAttributes[2].value = protoPlot.properties.id;
  constr.staticAttributes[3].value = `${ protoPlot.properties.name } PL ${ floor }`;
  constr.staticAttributes[4].value = `${ floor }`;
  constr.staticAttributes[5].value = 'false';
  constr.staticAttributes[6].value = protoPlot.properties.usage;

  constr.active = getConstrActive(
    constr.active, protoPlot.properties.usage,
    Number.parseInt(protoPlot.properties.area), exportStrings);

  return constr;
};

const createFutu = (protoPlot, floor, template, exportStrings) => {
  let futu = clone(template);

  futu.entity_name = getConstrId(protoPlot.properties.id, floor);

  futu.active = getConstrActive(
    futu.active, protoPlot.properties.usage,
    Number.parseInt(protoPlot.properties.area), exportStrings);

  return futu;
};

// Directories
const dirTemplate = path.join(__dirname, './template/');
const dirOut = path.join(__dirname, './generated/');

// Filenames
const fileMain = 'main.json'
const fileExportDomain = 'export_domain.json';
const fileExportContextBroker = 'export_context_broker.json';
const filePlot = 'plot.json';
const fileConstr = 'construction.json';
const fileFutu = 'aux_construction_future.json';
const fileGeoData = 'geodata.json';
const fileExportStrings = 'exports.json';

// Input data
let geoData = require(path.join(dirTemplate, fileGeoData)).features;
let exportStrings = require(path.join(dirTemplate, fileExportStrings));
let exportDomain = require(path.join(dirTemplate, fileExportDomain));
let exportContextBroker = require(path.join(dirTemplate, fileExportContextBroker));

// Templates
let mainTemplate = require(path.join(dirTemplate, fileMain));
let plotTemplate = require(path.join(dirTemplate, filePlot));
let constrTemplate = require(path.join(dirTemplate, fileConstr));
let futuTemplate = require(path.join(dirTemplate, fileFutu));

// Output
let plotOutputFile = path.join(dirOut, filePlot);
let constrOutputFile = path.join(dirOut, fileConstr);
let futuOutputFile = path.join(dirOut, fileFutu);

// Output data
mainTemplate.domain = exportDomain;
mainTemplate.contextBroker = exportContextBroker;

let plotOutput = clone(mainTemplate);
let constrOutput = clone(mainTemplate);
let futuOutput = clone(mainTemplate);

// Adding full exports, but not in plot, plot is fully static
constrOutput.exports = getExports(constrOutput.exports, exportStrings);
futuOutput.exports = getExports(futuOutput.exports, exportStrings);

var plots = 0;
var constrs = 0;
// For each plot in geoData
for (let protoPlot of geoData) {
  plotOutput.entities.push(createPlot(protoPlot, plotTemplate));

  for (let i in range(protoPlot.properties.floors)) {
    constrOutput.entities.push(createConstr(protoPlot, i , constrTemplate, exportStrings));
    futuOutput.entities.push(createFutu(protoPlot, i, futuTemplate, exportStrings));

    constrs++;
  }

  plots++;
}

console.log(`${ constrs } constructions in ${ plots } plots`);

saveJSONFile(plotOutputFile, plotOutput);
saveJSONFile(constrOutputFile, constrOutput);
saveJSONFile(futuOutputFile, futuOutput);
