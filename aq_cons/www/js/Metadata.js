
const additionalAQConsInfoCatalog = {
  'aq_cons': { colour: '#5476BB', icon: '../verticals/aq_cons/img/menuPanel/SC_ic_vertical_AQCons_M.svg' },
  'aq_cons.sensor': { colour: '#9d61f9', icon: '../verticals/aquasig-theme/img/icons/map/sensor-agua.svg' },
}
App.Metadata.prototype._additionalInfoCatalog = Object.assign(App.Metadata.prototype._additionalInfoCatalog, additionalAQConsInfoCatalog);