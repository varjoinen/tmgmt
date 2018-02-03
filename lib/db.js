const sqlite = require('sqlite');
const moment = require('moment');
const bluebird = require('bluebird');

const getDatabase = (file) => {
  return sqlite.open(file, { bluebird })
    .then((db) => {
      return db.run('CREATE TABLE IF NOT EXISTS time_reports (id INTEGER PRIMARY KEY, description TEXT, date TEXT, time_in_minutes INTEGER);')
      .then(() => {
        return db.run('CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY, tag TEXT, time_report_id INTEGER, FOREIGN KEY(time_report_id) REFERENCES time_reports(id))');
      })
      .then(() => db);
    });
}

const insertTimeReport = (db, description, date, tags, time) => {
  return db.prepare('INSERT INTO time_reports (description, date, time_in_minutes) VALUES (?,?,?)')
    .then((stmt) => {
      return stmt.run(
        description,
        date,
        time)
        .then((resp) => {
          if ( tags && tags.length ) {
            const report_id = resp.stmt.lastID

            return db.prepare('INSERT INTO tags (tag, time_report_id) VALUES (?,?)')
              .then((tagStmt) => {
                tags.forEach((tag) => {
                  tagStmt.run(
                    tag,
                    resp.stmt.lastID);
                });
              });
          }
        });
    });
}

const getTimeReports = (db, startDate, endDate, tag) => {
  return db.prepare('SELECT * FROM time_reports WHERE date BETWEEN (?) AND (?);')
    .then((stmt) => {
      return stmt.all(
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD'))
    });
}

const getTags = (db, report_id) => {
  return db.prepare('SELECT tag FROM tags WHERE time_report_id = ?;')
    .then((stmt) => {
      return stmt.all(report_id)
        .then((rows) => {
          return rows.map((row) => row.tag);
        })
    });
}

const removeReport = (db, id) => {
  return _removeTagsByReportId(db, id)
    .then(() => {
      _removeReport(db, id);
    });
}

const _removeTagsByReportId = (db, id) => {
  return db.prepare('DELETE FROM tags WHERE time_report_id = ?;')
    .then((stmt) => {
      return stmt.run(id)
    });
}
const _removeReport = (db, id) => {
  return db.prepare('DELETE FROM time_reports WHERE id = ?;')
    .then((stmt) => {
      return stmt.run(id)
    })
}

module.exports = {
  getDatabase,
  insertTimeReport,
  getTimeReports,
  getTags,
  removeReport
};
