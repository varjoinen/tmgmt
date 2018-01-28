#!/usr/bin/env node

const program = require('commander');
const moment = require('moment');
const database = require('../lib/db');
const util = require('../lib/util');
const table = require('cli-table');

const toDisplayFormat = (minutes) => {
    if ( !minutes ) {
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

program
    .option('-s --start <date>', 'start date (inclusive), yyyyMMdd')
    .option('-e --end <date>', 'end date (inclusive), yyyyMMdd')
    .parse(process.argv);

try {
    const db = database.getDatabase('./tmgmt.sqlite');

    if ( program.start ) {
        util.validateDateString(program.start);
    }

    if ( program.end ) {
        util.validateDateString(program.end);
    }

    const startDate = program.start ? moment(program.start) : moment().startOf('isoweek');
    const endDate = program.end ? moment(program.end) : moment().endOf('isoweek');

    database.getTimeReports(db, startDate, endDate, (err, rows) => {
        if ( err ) {
            throw err;
        }

        let t = new table({
            head: ['id', 'description', 'tags', 'time', 'date']
        });

        if ( rows.length ) {
            let totalMinutes = 0;
            rows.forEach((row) => {
                totalMinutes += row.time_in_minutes;
                t.push([row.id, util.take(row.description, 100), util.take(row.tags, 50), toDisplayFormat(row.time_in_minutes), row.date.split(' ')[0]]);
            })

            t.push(['Total', '', '', toDisplayFormat(totalMinutes), '']);
        }
        console.log('\nReports between ' + startDate.format('YYYY-MM-DD') + ' - ' + endDate.format('YYYY-MM-DD'));
        console.log(t.toString());
    });
} catch (e) {
    console.error(e.message);
}