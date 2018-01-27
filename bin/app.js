#!/usr/bin/env node

const moment = require('moment');
const sqlite = require('sqlite3');

const db = new sqlite.Database('./tmgmt.sqlite');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS time_reports (id INTEGER PRIMARY KEY, description TEXT, date TEXT, tags TEXT, time_in_minutes INTEGER);");
});

let args = process.argv.slice(2);
let argCount = args.length

let withDate = false

if ( argCount === 3 ) {
    withDate = true;
}

if ( argCount != 3 && argCount != 2 ) {
    console.log("Usage: tmgmt [date, format yyyyMMdd] time 'description'");
    process.exit(1);
}

try {
    // TODO refactor
    let date = withDate ? moment(args[0]) : moment();
    let time = withDate ? args[1] : args[0];
    let description = withDate ? args[2] : args[1];

    db.serialize(() => {
        let stmt = db.prepare("INSERT INTO time_reports (description, date, tags, time_in_minutes) VALUES (?,?,?,?)");

        stmt.run(description, date.format("YYYY-MM-DD HH:mm:ss.SSS"), parseTags(description).join(), parseTimeToMinutes(time));

        stmt.finalize();

        db.each("SELECT * FROM time_reports", (err, row) => {
            console.log(row);
        });
    })

    console.log("done");
} catch (e) {
    console.error(e.message);
} finally {
    db.close();
}

/*
 * Parse tags from description.
 * 
 * Supports alphanumeric tags with hyphens
 * and underscores.
 */
function parseTags(string) {
    let tags = [];

    if ( string ) {

        let hashtags = string.match(/#[a-zA-Z0-9_\-]+/gi)

        if ( hashtags ) {
            for ( i = 0; i < hashtags.length; i++ ) {
                tags.push(hashtags[i].replace("#", ""));
            }
        }
    }

    return tags;
}

/*
 * Parse given time string to minutes
 * 
 * 7.5 -> 7h 5m -> 7 5 -> 425
 * 
 * 30 -> 30m -> 30
 * 
 * 0,50 -> 50min -> 50
 */
function parseTimeToMinutes(string) {
    if ( !string ) {
        throw new Error("Cannot parse empty time string: " + string);
    }

    let hasDelimiter = /[,\.]/.test(string);
    let hasSpace = /[\s]+/.test(string)
    let hasLetters = containsLetter(string);

    if ( hasDelimiter && hasLetters ) {
        throw new Error("Cannot parse time with both delimiter and time units");
    }

    let timeInMinutes = 0;

    if ( hasDelimiter || hasSpace ) {
        let parts = string.split(/[\s,\.]+/);
        let partCount = parts.length;

        if ( partCount > 2 ) {
            throw new Error("Cannot parse time: " + string);
        }

        let partOneUnit = containsLetter(parts[0]) ? getLetters(parts[0]).join("") : "hours";
        timeInMinutes += convertTime(
            stripLetters(parts[0]),
            partOneUnit,
            "minutes");

        let partTwoUnit = containsLetter(parts[1]) ? getLetters(parts[1]).join("") : "minutes";
        timeInMinutes += convertTime(
            stripLetters(parts[1]),
            partTwoUnit,
            "minutes");
    } else {
        if ( /([0-9]+)([a-zA-Z]+)([0-9]+)/.test(string) ) {
            throw new Error("Invalid time: " + string);
        }

        let unit = containsLetter(string) ? getLetters(string).join("") : "minutes";
        timeInMinutes = convertTime(
            stripLetters(string),
            unit,
            "minutes");
    }

    return timeInMinutes;
}

/*
 * Convert time strings.
 */
function convertTime(string, fromUnit, toUnit) {
    if ( toUnit !== "minutes" ) {
        throw new Error("Time conversion does not support target unit: " + toUnit);
    }

    if ( !fromUnit ) {
        throw new Error("Need source unit to convert time");
    }

    if ( ["h", "H", "hour", "Hour", "hours", "Hours"].indexOf(fromUnit) > -1) {
        return parseInt(string) * 60;
    } else if ( ["m", "M", "min", "Min", "minutes", "Minutes"].indexOf(fromUnit) > -1 ) {
        return parseInt(string);
    } else {
        throw new Error("Unknown source unitfor time: " + fromUnit);
    }
}

function containsLetter(string) {
    return /[a-zA-Z]/.test(string);
}

function getLetters(string) {
    if ( !string ) {
        return [];
    }
    return string.match(/[a-zA-Z]+/);
}

function stripLetters(string) {
    if ( !string ) {
        return ""
    }
    return string.replace(/[a-zA-Z]+/, "");
}