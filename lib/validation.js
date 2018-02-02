const validateParams = (program, tagValueWithHash = true) => {
    if ( program.start ) {
        validateDateString(program.start);
    }

    if ( program.end ) {
        validateDateString(program.end);
    }

    if ( program.tag ) {
        validateTag(program.tag, tagValueWithHash);
    }
}

const validateDateString = (string) => {
    if ( !/^([1-9])([0-9]{3})([0-9]{2})([0-9]{2})$/.test(string) ) {
        throw Error('Invalid date: ' + string)
    }
}

const validateTag = (string, withHash) => {
    let regex = withHash ? /#[a-zA-Z0-9_\-]+/ : /[a-zA-Z0-9_\-]+/;

    if ( !regex.test(string) ) {
        throw new Error('invalid tag' + string);
    }
}

module.exports = {
    validateParams,
    validateDateString,
    validateTag
}