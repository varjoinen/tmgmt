const containsLetter = (string) => {
    return /[a-zA-Z]/.test(string);
}

const getLetters = (string) => {
    if ( !string ) {
        return [];
    }
    return string.match(/[a-zA-Z]+/);
}

const stripLetters = (string) => {
    if ( !string ) {
        return ''
    }
    return string.replace(/[a-zA-Z]+/, '');
}

/*
 * Remove duplicates from given array
 */
const unique = (array) => {
    return array.filter((v, i, a) => a.indexOf(v) === i);
}

/*
 * Parse tags from description.
 * 
 * Supports alphanumeric tags with hyphens
 * and underscores.
 */
const parseTags = (string) => {
    let tags = [];

    if ( string ) {

        let hashtags = string.match(/#[a-zA-Z0-9_\-]+/gi)

        if ( hashtags ) {
            for ( i = 0; i < hashtags.length; i++ ) {
                tags.push(hashtags[i].replace('#', ''));
            }
        }
    }

    return unique(tags);
}

const take = (string, size) => {
    return string.slice(0, size);
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
const parseTimeToMinutes = (string) => {
    if ( !string ) {
        throw new Error('Cannot parse empty time string: ' + string);
    }

    let hasDelimiter = /[,\.]/.test(string);
    let hasSpace = /[\s]+/.test(string)
    let hasLetters = containsLetter(string);

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

        let partOneUnit = containsLetter(parts[0]) ? getLetters(parts[0]).join('') : 'hours';
        timeInMinutes += convertTime(
            stripLetters(parts[0]),
            partOneUnit,
            'minutes');

        let partTwoUnit = containsLetter(parts[1]) ? getLetters(parts[1]).join('') : 'minutes';
        timeInMinutes += convertTime(
            stripLetters(parts[1]),
            partTwoUnit,
            'minutes');
    } else {
        if ( /([0-9]+)([a-zA-Z]+)([0-9]+)/.test(string) ) {
            throw new Error('Invalid time: ' + string + '. Valid formats are eg. "7h 30m", 7,30, 7.30, "7 30"');
        }

        let unit = containsLetter(string) ? getLetters(string).join('') : 'minutes';
        timeInMinutes = convertTime(
            stripLetters(string),
            unit,
            'minutes');
    }

    return timeInMinutes;
}

/*
 * Convert time strings.
 */
const convertTime = (string, fromUnit, toUnit) => {
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

module.exports = {
    containsLetter,
    getLetters,
    stripLetters,
    parseTags,
    take,
    parseTimeToMinutes,
    convertTime
};