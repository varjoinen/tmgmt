
const bluebird = require('bluebird');
const database = require('./db');

const getReports = (db, startDate, endDate, tag) => {
    return database.getTimeReports(db, startDate, endDate, tag)
        .then((reports) => {
            return bluebird.map(reports, (report) => {
                return addTags(db, report);
            });
        });
}

const addTags = (db, report) => {
    return database.getTags(db, report.id)
        .then((tags) => {
            let clone = Object.assign({}, report);
            clone.tags = tags.join(',');

            return clone;
        });
}

const remove = (db, id) => {
    return database.removeReport(db, id);
}

module.exports = {
    getReports,
    remove
};