const program = require('commander');
const database = require('../lib/db');
const report = require('../lib/report');
const env = require('../lib/env');

program.parse(process.argv);

database.getDatabase(env.getEnv().dbFilePath)
  .then((db) => {
    return report.remove(db, program.args[0]);
  })
.catch((e) => { console.log(e.message); });
