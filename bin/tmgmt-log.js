const program = require('commander');
const moment = require('moment');
const bluebird = require('bluebird');
const database = require('../lib/db');
const util = require('../lib/util');
const env = require('../lib/env');

const parseArguments = (args) => {
    let keys

    if (args.length === 3) {
        keys = ['date', 'time', 'description'];
    } else {
        keys = ['time', 'description'];
    }

    const values = {};

    for ( i = 0; i < args.length; i++ ) {
        values[keys[i]] = args[i];
    }

    return values;
}

/*
 * Validation functions
 */
const validateArguments = (args) => {
    let argCount = args.length

    if ( argCount != 3 && argCount != 2 ) {
        console.log('Usage: tmgmt [date, format yyyyMMdd] time description');
        process.exit(1);
    }
}

program
  .parse(process.argv);


database.getDatabase(env.getEnv().dbFilePath)
    .then((db) => {
        let args = program.args;

        validateArguments(args);

        let values = parseArguments(args);

        const date = values['date'] ? moment(values['date']) : moment();
        const time = values['time']
        const description = values['description']

        return database.insertTimeReport(
            db,
            description,
            date.format('YYYY-MM-DD'),
            util.parseTags(description),
            util.parseTimeToMinutes(time))
    }).catch(e => console.log(e.message));