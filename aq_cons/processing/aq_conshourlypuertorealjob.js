'use strict';

const appDir = require('app-root-path').path;
const ospath = require('path');
const request = require('request-promise');
const _ = require('lodash');

const config = require(ospath.join(appDir, 'config'));
const BaseJob = require(ospath.join(appDir, 'jobs', 'basejob'));
const utils = require(ospath.join(appDir, 'utils'));
const log = utils.log();
const PGSQLModel = require('../../../../models/pgsqlmodel');
const moment = require('moment-timezone');
const pgsqlConfig = config.getData().pgsql;

class AqConsHourlyLastdataPuertoRealJob extends BaseJob {

  constructor(cfg) {
    super(cfg);
  }

  getCreateTable(data) {
    // Creation of the needed tables occurs in the vertical/category creation
    return 'SELECT 1 AS placeholder;';
  }

  _aggregate(job, done) {
    /*
     * - type: aqConsHourlyLastdataPuertoReal
     *   tableName: aq_cons_const_lastdata
     *   job: aq_conshourlylastdatapuertorealjob
     *   apiKey: XXXX
     *   category: aq_cons
     *   magnitudeRange: 1
     *   unitRange: hour
     *   truncateToUnit: hour
     *   schedule: '* 1 *1 * * *'
     *   carto: false
     */

    let models = {
      "nov_jun_week": {
        "1" : [ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
        "180" : [ 2,0,1,1,3,6,14,26,25,1,1,1,1,15,20,1,1,1,1,1,20,25,10,2 ],
        "315" : [ 3,1,1,1,1,1,70,80,60,1,1,1,1,1,1,1,1,20,25,20,10,5,5,3 ],
        "560" : [ 1,1,1,1,1,1,80,80,80,5,5,5,10,10,10,3,3,2,80,80,80,10,10,0 ],
        "10000" : [ 1,1,1,1,1,1,90,90,90,7,7,7,10,10,10,4,4,4,90,90,90,20,20,0 ]
      },
      "nov_jun_weekend" : {
        "1" : [ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
        "135" : [ 3,1,1,1,1,1,1,1,10,10,10,10,2,2,1,1,1,1,10,15,20,20,10,1 ],
        "255" : [ 1,1,1,1,1,1,1,1,1,20,30,30,40,5,1,1,1,1,10,15,50,30,10,1 ],
        "440" : [ 5,1,1,1,1,1,1,20,40,40,1,1,10,20,10,10,10,10,50,50,50,50,50,6 ],
        "10000" : [ 33,1,1,1,1,1,1,60,60,60,10,10,10,30,30,30,30,30,70,70,70,70,70,30 ]
      },
      "jul_oct_week": {
        "1" : [ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
        "180" : [ 2,0,1,1,3,6,14,26,25,1,1,1,1,15,20,1,1,1,1,1,20,25,10,2 ],
        "315" : [ 3,1,1,1,1,1,70,80,60,1,1,1,1,1,1,1,1,20,25,20,10,5,5,3 ],
        "560" : [ 1,1,1,1,1,1,80,80,80,5,5,5,10,10,10,3,3,2,80,80,80,10,10,0 ],
        "10000" : [ 1,1,1,1,1,1,90,90,90,7,7,7,10,10,10,4,4,4,90,90,90,20,20,0 ]
      },
      "jul_oct_weekend" : {
        "1" : [ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
        "135" : [ 3,1,1,1,1,1,1,1,10,10,10,10,2,2,1,1,1,1,10,15,20,20,10,1 ],
        "255" : [ 1,1,1,1,1,1,1,1,1,20,30,30,40,5,1,1,1,1,10,15,50,30,10,1 ],
        "440" : [ 5,1,1,1,1,1,1,20,40,40,1,1,10,20,10,10,10,10,50,50,50,50,50,6 ],
        "10000" : [ 33,1,1,1,1,1,1,60,60,60,10,10,10,30,30,30,30,30,70,70,70,70,70,30 ]
      },
    };

    const weekDays = [1,2,3,4,5];
    const winterSpring = [0,1,2,3,4,5];
    const jobInfo = `job ${job.id}: type '${job.type}' - title '${job.data.title}'`;
    const apiKey = job.data.customParam;
    const fromDate = new moment(job.data.date).subtract(3 + job.data.magnitudeRange, job.data.unitRange).format("YYYY-MM-DD");
    const toDate = new moment(job.data.date).subtract(3, job.data.unitRange).format("YYYY-MM-DD");

    const datePattern = /\d{4}-\d{1,2}-\d{1,2}/;
    log.info('apiKey ------ ', apiKey);

    var options = {
      uri: 'http://77.241.112.100:8077/gen-publicservices-web/rest/contadores/lecturas',
      qs: {
        "desde": fromDate,
        "hasta": toDate
      },
      headers: {
          "User-Agent": "Request-Promise",
          "Accept": "application/json",
          "X_API_KEY": apiKey
      },
      json: true
    };
    // log.info('options', options)

    let requests = "";

    request(options)
    .then(function (data) {


      // log.debug('data', data);

      let bynumSerie =  _(data).groupBy(v => ([v.numSerie]))
                        .map( v =>
                          _.merge(
                            _.pick( v[1], 'numSerie', 'fechaHora'),
                            {'volumenL': _.subtract( v[1]['volumenL'], v[0]['volumenL'] ) }
                          )
                        )
                        .value();

      log.debug('bynumSerie', bynumSerie);

      bynumSerie.forEach(element => {

        if (element.volumenL != '0') {
          let secDate = new Date(element.fechaHora);
          let secWeekDay = secDate.getDay();
          let secMonth = secDate.getMonth();
          let monthDay = "jul_oct";
          if ( winterSpring.indexOf(secMonth) > -1 ) {
            monthDay = "nov_jun"
          }
          if ( weekDays.indexOf(secWeekDay) > -1 ) {
            monthDay = monthDay + '_week';
          } else {
            monthDay = monthDay + '_weekend';
          }
          let currentDate = new Date();
          let currentHour = currentDate.getHours();
          for (let totalL in models[monthDay]) {
            if ( element.volumenL ) {
              if  ( element.volumenL >= totalL ) {
                continue;
              } else {
                let percent = models[monthDay][totalL][currentHour] * 100 / totalL;
                let valueL = ( percent * element.volumenL / 100 ) + ( (Math.random() * 0.007) + 0.001 ) ;
                let date = datePattern.exec(element.fechaHora)[0] + 'T' + ("0" + currentHour).slice(-2) + ':00:00Z';
                let sql = `
                  SELECT urbo_aq_cons_propagate_puertoreal('${job.data.idScope}', 'construction_id:${element.numSerie}', '${valueL}', '${date}');
                `;
                requests = requests.concat(sql);
                break;
              }
            }

          }
        }

      });

      let callback = function (err, data) {
        if (err) {
          log.error(`${ jobInfo } FAILED: Error executing query`);
          log.error(err);
          return done(err);
        }

        log.debug(`${ jobInfo } DONE`);
        return done();
      };

      log.debug('requests', requests);

      let pgModel = new PGSQLModel(pgsqlConfig);
      pgModel.query(requests, null, callback);

    });

  }

}

module.exports = AqConsHourlyLastdataPuertoRealJob;
