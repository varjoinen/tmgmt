const sqlite = require('sqlite3');

const getDatabase = (file) => {
    const db = new sqlite.Database(file);

    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS time_reports (id INTEGER PRIMARY KEY, description TEXT, date TEXT, tags TEXT, time_in_minutes INTEGER);');
    });

    return db;
}

const insertTimeReport = (db, description, date, tags, time) => {
    db.serialize(() => {
        let stmt = db.prepare('INSERT INTO time_reports (description, date, tags, time_in_minutes) VALUES (?,?,?,?)');
        stmt.run(description, date, tags, time);
        stmt.finalize();
    })
}

const getTimeReports = (db, cb) => {
    db.all('SELECT * FROM time_reports;', cb);
}

module.exports = {
    getDatabase,
    insertTimeReport,
    getTimeReports
};