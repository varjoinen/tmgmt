const program = require('commander');
const moment = require('moment');
const table = require('cli-table');
const bluebird = require('bluebird');
const database = require('../lib/db');
const util = require('../lib/util');
const report = require('../lib/report');
const validation = require('../lib/validation');
const env = require('../lib/env');

const toDisplayFormat = (minutes) => {
  if ( minutes !== 0 && !minutes ) {
    throw new Error("Invalid minutes value: " + minutes)
  }
  let mins = minutes % 60;
  let hours = (minutes - mins) / 60;

  if ( mins == 0 ) {
    return hours + 'h'
  } else {
    return hours + 'h ' + mins + 'm'
  }
}

const printReports = (reports, startDate, endDate) => {
  let t = new table({
    head: ['id', 'description', 'tags', 'time', 'date']
  });

  let totalMinutes = 0;

  if ( reports.length ) {
    reports.forEach((report) => {
      totalMinutes += report.time_in_minutes;

      t.push([report.id, util.take(report.description, 100), util.take(report.tags.join(','), 50), toDisplayFormat(report.time_in_minutes), report.date.split(' ')[0]]);
    });
  }

  t.push(['Total', '', '', toDisplayFormat(totalMinutes), '']);

  console.log('Time reports between ' + startDate.format('YYYY-MM-DD') + ' - ' + endDate.format('YYYY-MM-DD'));
  console.log(t.toString());
}

program
  .option('-s --start <date>', 'start date (inclusive), yyyyMMdd')
  .option('-e --end <date>', 'end date (inclusive), yyyyMMdd')
  .option('-t --tag <tag>', 'tag to match (without hash)')
  .parse(process.argv);

validation.validateParams(program, false);

const startDate = program.start ? moment(program.start) : moment().startOf('isoweek');
const endDate = program.end ? moment(program.end) : moment().endOf('isoweek');

database.getDatabase(env.getEnv().dbFilePath)
  .then((db) => {
    return report.getReports(db, startDate, endDate, program.tag);
  })
  .then((reports) => {
    return printReports(reports, startDate, endDate);
  })
.catch((e) => { console.log(e.message); });
