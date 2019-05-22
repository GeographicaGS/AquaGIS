
App.Utils.getNextWeek = function() {
  return [
    moment(moment().startOf('isoWeek').add(7, 'days').toDate()).format('YYYY-MM-DD HH:mm:ss'),
    moment(moment().endOf('isoWeek').add(7, 'days').toDate()).format('YYYY-MM-DD HH:mm:ss')
  ];
}

App.Utils.getPrevWeek = function() {
  return [
    moment(moment().startOf('isoWeek').subtract(7, 'days').toDate()).format('YYYY-MM-DD HH:mm:ss'),
    moment(moment().startOf('isoWeek').subtract(1, 'days').endOf('day').toDate()).format('YYYY-MM-DD HH:mm:ss')
  ];
}