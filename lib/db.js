const sqlite = require('sqlite3');
const moment = require('moment');

const getDatabase = (file) => {
    const db = new sqlite.Database(file);

    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS time_reports (id INTEGER PRIMARY KEY, description TEXT, date TEXT, tags TEXT, time_in_minutes INTEGER);');
    });

    return db;
}

const insertTimeReport = (db, description, date, tags, time) => {
    db.serialize(() => {
        const stmt = db.prepare('INSERT INTO time_reports (description, date, tags, time_in_minutes) VALUES (?,?,?,?)');
        stmt.run(description, date, tags, time);
        stmt.finalize();
    })
}

const getTimeReports = (db, startDate, endDate, cb) => {

    const stmt = db.prepare('SELECT * FROM time_reports WHERE date BETWEEN (?) AND (?);');
        stmt.all(
            startDate.format('YYYY-MM-DD'),
            endDate.format('YYYY-MM-DD'),
            cb);
        stmt.finalize();
}

const getCurrentWeekTimReports = (db, cb) => {
    const monday = moment().startOf('isoweek');
    const sunday = moment().endOf('isoweek');

    const stmt = db.prepare('SELECT * FROM time_reports WHERE date BETWEEN (?) AND (?);');
        stmt.all(monday.format('YYYY-MM-DD'), sunday.format('YYYY-MM-DD'), cb);
        stmt.finalize();
}

module.exports = {
    getDatabase,
    insertTimeReport,
    getTimeReports,
    getCurrentWeekTimReports
};