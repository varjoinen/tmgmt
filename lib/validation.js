const validateParams = (program) => {
    if ( program.start ) {
        validateDateString(program.start);
    }

    if ( program.end ) {
        validateDateString(program.end);
    }

    if ( program.tag ) {
        validateTag(program.tag);
    }
}

const validateDateString = (string) => {
    if ( !/^([1-9])([0-9]{3})([0-9]{2})([0-9]{2})$/.test(string) ) {
        throw Error('Invalid date: ' + string)
    }
}

module.exports = {
    validateParams,
    validateDateString
}