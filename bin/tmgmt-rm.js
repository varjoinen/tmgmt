const program = require('commander');
const database = require('../lib/db');
const report = require('../lib/report');

program.parse(process.argv);

report.remove(database, program.args[0])
.catch((e) => { console.log(e.message); });
