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

const validateDateString = (string) => {
    if ( !/^([1-9])([0-9]{3})([0-9]{2})([0-9]{2})$/.test(string) ) {
        throw Error('Invalid date: ' + string)
    }
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

    return tags;
}

const take = (string, size) => {
    return string.slice(0, size);
}

module.exports = {
    containsLetter,
    getLetters,
    stripLetters,
    parseTags,
    take,
    validateDateString
};