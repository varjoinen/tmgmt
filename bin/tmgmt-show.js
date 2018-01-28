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
  .parse(process.argv);

try {
    const db = database.getDatabase('./tmgmt.sqlite');

    database.getCurrentWeekTimReports(db, (err, rows) => {
        if ( err ) {
            throw err;
        }

        let t = new table({
            head: ['id', 'description', 'tags', 'time', 'date']
        });

        let totalMinutes = 0;
        rows.forEach((row) => {
            totalMinutes += row.time_in_minutes;
            t.push([row.id, util.take(row.description, 100), util.take(row.tags, 50), toDisplayFormat(row.time_in_minutes), row.date.split(' ')[0]]);
        })

        t.push(['Total', '', '', toDisplayFormat(totalMinutes), '']);

        console.log('\n Week ' + moment().isoWeek());
        console.log(t.toString());
    });
} catch (e) {
    console.error(e.message);
}