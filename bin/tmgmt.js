#!/usr/bin/env node

const program = require('commander');

/*
 * The program
 */

program
  .version('1.0.0', '-v, --version')
  .command('log', 'log time report')
  .command('show','show time reports')
  .command('export', 'export time reports')
  .command('rm', 'remove report by id')
  .parse(process.argv)
