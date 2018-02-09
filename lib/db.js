const sqlite = require('sqlite');
const moment = require('moment');
const bluebird = require('bluebird');
const env = require('./env');

const getConnection = () => {
  return sqlite.open(env.getEnv().dbFilePath, { bluebird })
    .then((conn) => {
      return conn.run('CREATE TABLE IF NOT EXISTS time_reports (id INTEGER PRIMARY KEY, description TEXT, date TEXT, time_in_minutes INTEGER);')
      .then(() => {
        return conn.run('CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY, tag TEXT, time_report_id INTEGER, FOREIGN KEY(time_report_id) REFERENCES time_reports(id))');
      })
      .then(() => conn);
    });
}

const insertTimeReport = (description, date, tags, time) => {
  return getConnection()
    .then((conn) => {
      return conn.prepare('INSERT INTO time_reports (description, date, time_in_minutes) VALUES (?,?,?)')
      .then((stmt) => {
        return stmt.run(
          description,
          date,
          time)
          .then((resp) => {
            if ( tags && tags.length ) {
              const report_id = resp.stmt.lastID

              return conn.prepare('INSERT INTO tags (tag, time_report_id) VALUES (?,?)')
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
    })
}

const getTimeReports = (startDate, endDate, tag) => {
  return getConnection()
    .then((conn) => {
      return conn.prepare('SELECT * FROM time_reports WHERE date BETWEEN (?) AND (?);')
        .then((stmt) => {
          return stmt.all(
            startDate.format('YYYY-MM-DD'),
            endDate.format('YYYY-MM-DD'))
        });
    });
}

const getTags = (report_id) => {
  return getConnection()
    .then((conn) => {
      return conn.prepare('SELECT tag FROM tags WHERE time_report_id = ?;')
      .then((stmt) => {
        return stmt.all(report_id)
          .then((rows) => {
            return rows.map((row) => row.tag);
          })
      });
    });
}

const removeReport = (id) => {
  return getConnection()
  .then((conn) => {
    return _removeTagsByReportId(conn, id)
      .then(() => {
        return _removeReport(conn, id);
      });
  });
}

const _removeTagsByReportId = (conn, id) => {
  return conn.prepare('DELETE FROM tags WHERE time_report_id = ?;')
    .then((stmt) => {
      return stmt.run(id)
    });
}
const _removeReport = (conn, id) => {
  return conn.prepare('DELETE FROM time_reports WHERE id = ?;')
    .then((stmt) => {
      return stmt.run(id)
    })
}

module.exports = {
  getConnection,
  insertTimeReport,
  getTimeReports,
  getTags,
  removeReport
};
