
const bluebird = require('bluebird');

const getReports = (database, startDate, endDate, tag) => {
  return database.getTimeReports(startDate, endDate, tag)
    .then((reports) => {
      return bluebird.map(reports, (report) => {
        return addTags(database, report);
      }).then((reports) => {
        return reports.filter(r => !tag || r.tags.includes(tag) );
      });
    });
}

const addTags = (database, report) => {
  return database.getTags(report.id)
    .then((tags) => {
      let clone = Object.assign({}, report);
      clone.tags = tags;

      return clone;
    });
}

const remove = (database, id) => {
  return database.removeReport(id);
}

module.exports = {
  getReports,
  remove,
  addTags
};
