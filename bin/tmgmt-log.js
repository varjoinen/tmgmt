#!/usr/bin/env node

const program = require('commander');
const moment = require('moment');
const database = require('../lib/db');
const util = require('../lib/util');

/*
 * Parse given time string to minutes
 * 
 * 7.5 -> 7h 5m -> 7 5 -> 425
 * 
 * 30 -> 30m -> 30
 * 
 * 0,50 -> 50min -> 50
 */
parseTimeToMinutes = (string) => {
    if ( !string ) {
        throw new Error('Cannot parse empty time string: ' + string);
    }

    let hasDelimiter = /[,\.]/.test(string);
    let hasSpace = /[\s]+/.test(string)
    let hasLetters = util.containsLetter(string);

    if ( hasDelimiter && hasLetters ) {
        throw new Error('Cannot parse time with both delimiter and time units');
    }

    let timeInMinutes = 0;

    if ( hasDelimiter || hasSpace ) {
        let parts = string.split(/[\s,\.]+/);
        let partCount = parts.length;

        if ( partCount > 2 ) {
            throw new Error('Cannot parse time: ' + string);
        }

        let partOneUnit = util.containsLetter(parts[0]) ? util.getLetters(parts[0]).join('') : 'hours';
        timeInMinutes += convertTime(
            util.stripLetters(parts[0]),
            partOneUnit,
            'minutes');

        let partTwoUnit = util.containsLetter(parts[1]) ? util.getLetters(parts[1]).join('') : 'minutes';
        timeInMinutes += convertTime(
            util.stripLetters(parts[1]),
            partTwoUnit,
            'minutes');
    } else {
        if ( /([0-9]+)([a-zA-Z]+)([0-9]+)/.test(string) ) {
            throw new Error('Invalid time: ' + string);
        }

        let unit = util.containsLetter(string) ? util.getLetters(string).join('') : 'minutes';
        timeInMinutes = convertTime(
            util.stripLetters(string),
            unit,
            'minutes');
    }

    return timeInMinutes;
}

/*
 * Convert time strings.
 */
convertTime = (string, fromUnit, toUnit) => {
    if ( toUnit !== 'minutes' ) {
        throw new Error('Time conversion does not support target unit: ' + toUnit);
    }

    if ( !fromUnit ) {
        throw new Error('Need source unit to convert time');
    }

    if ( ['h', 'H', 'hour', 'Hour', 'hours', 'Hours'].indexOf(fromUnit) > -1) {
        return parseInt(string) * 60;
    } else if ( ['m', 'M', 'min', 'Min', 'minutes', 'Minutes'].indexOf(fromUnit) > -1 ) {
        return parseInt(string);
    } else {
        throw new Error('Unknown source unitfor time: ' + fromUnit);
    }
}

parseArguments = (args) => {
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
validateArguments = (args) => {
    let argCount = args.length

    let withDate = false

    if ( argCount === 3 ) {
        withDate = true;
    }

    if ( argCount != 3 && argCount != 2 ) {
        console.log('Usage: tmgmt [date, format yyyyMMdd] time "description"');
        process.exit(1);
    }
}

program
  .parse(process.argv);

try {
    const db = database.getDatabase('./tmgmt.sqlite');

    let args = program.args;

    validateArguments(args);

    let values = parseArguments(args);

    // TODO refactor
    const date = values['date'] ? moment(values['date']) : moment();
    const time = values['time']
    const description = values['description']

    database.insertTimeReport(
        db,
        description,
        date.format('YYYY-MM-DD HH:mm:ss.SSS'),
        util.parseTags(description).join(),
        parseTimeToMinutes(time))
} catch (e) {
    console.error(e.message);
}