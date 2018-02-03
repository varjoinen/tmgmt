const program = require('commander');
const moment = require('moment');
const bluebird = require('bluebird');
const database = require('../lib/db');
const util = require('../lib/util');
const validation = require('../lib/validation');
const report = require('../lib/report');

program
  .option('-s --start <date>', 'start date (inclusive), yyyyMMdd')
  .option('-e --end <date>', 'end date (inclusive), yyyyMMdd')
  .option('-t --tag <tag>', 'tag to match')
  .parse(process.argv);

validation.validateParams(program, false);

const startDate = program.start ? moment(program.start) : moment().startOf('isoweek');
const endDate = program.end ? moment(program.end) : moment().endOf('isoweek');

report.getReports(database, startDate, endDate, program.tag)
  .then((reports) => {
    console.log(JSON.stringify({reports}));
  })
  .catch((e) => { console.log(e); });
