#!/usr/bin/env node

const program = require('commander');

/*
 * The program
 */

try {
    program
        .version('1.0.0', '-v, --version')
        .command('log [date] <time> <description>', 'log time report')
            .alias('l')
        .command('show','show time reports')
            .alias('s')
        .parse(process.argv)
} catch (e) {
    console.error(e.message);
}