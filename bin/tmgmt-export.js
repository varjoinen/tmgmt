const program = require('commander');
const moment = require('moment');
const bluebird = require('bluebird');
const database = require('../lib/db');
const util = require('../lib/util');
const validation = require('../lib/validation');
const report = require('../lib/report');

const printReports = (reports, startDate, endDate) => {
    let t = new table({
        head: ['id', 'description', 'tags', 'time', 'date']
    });

    let totalMinutes = 0;

    if ( reports.length ) {
        reports.forEach((report) => {
            totalMinutes += report.time_in_minutes;

            t.push([report.id, util.take(report.description, 100), util.take(report.tags, 50), toDisplayFormat(report.time_in_minutes), report.date.split(' ')[0]]);
        });
    }

    t.push(['Total', '', '', toDisplayFormat(totalMinutes), '']);

    console.log('Time reports between ' + startDate.format('YYYY-MM-DD') + ' - ' + endDate.format('YYYY-MM-DD'));
    console.log(t.toString());
}

program
    .option('-s --start <date>', 'start date (inclusive), yyyyMMdd')
    .option('-e --end <date>', 'end date (inclusive), yyyyMMdd')
    .option('-t --tag <tag>', 'tag to match')
    .parse(process.argv);

validation.validateParams(program);

const startDate = program.start ? moment(program.start) : moment().startOf('isoweek');
const endDate = program.end ? moment(program.end) : moment().endOf('isoweek');

database.getDatabase('./tmgmt.sqlite')
    .then((db) => {
        return report.getReports(db, startDate, endDate, program.tag);
    })
    .then((reports) => {
        console.log(JSON.stringify({reports}));
    })
.catch((e) => { console.log(e); });