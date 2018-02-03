const assert = require('assert');
const bluebird = require('bluebird');
const report = require('../../lib/report');

const createTimeReportsWithTags = (items) => {
  let reports= [];

  items.forEach(item => {
    reports.push({
      id: item[0],
      description: item[1],
      date: item[2],
      time_in_minutes: item[3],
      tags: item[4]
    });
  });

  return reports;
}

const createTimeReportsWithoutTags = (items) => {
  let reports= [];

  items.forEach(item => {
    reports.push({
      id: item[0],
      description: item[1],
      date: item[2],
      time_in_minutes: item[3]
    });
  });

  return reports;
}

describe('report', () => {
  describe('#getReports()', () => {
    it('should return time reports returned by db', (done) => {
      const sampleData = [
        [1, 'desc 1', '2018-01-01', 400, []],
        [2, 'desc 2', '2018-01-02', 450, ['tag1', 'tag2']]
      ];

      const reports = createTimeReportsWithoutTags(sampleData);
      const expected = createTimeReportsWithTags(sampleData);

      let getTagsCallCount = 0;
      const database = {
        getTimeReports: () => bluebird.resolve(reports),
        getTags: () => {
          return new bluebird((resolve, reject) => {
            getTagsCallCount++;

            if (getTagsCallCount == 1) {
              resolve([]);
            } else if ( getTagsCallCount == 2 ) {
              resolve(['tag1', 'tag2']);
            } else {
              reject('should not call getTags over two times!');
            }
          });
        }
      };
      report.getReports(database, '', '', '')
        .then((actual) => {
          assert.deepEqual(actual, expected);
          done();
        })
        .catch((e) => console.log(e));
    });

    it('should filter by tag', (done) => {
      const sampleData = [
        [1, 'desc 1', '2018-01-01', 400, ['tag0']],
        [2, 'desc 2', '2018-01-02', 450, ['tag1', 'tag2']]
      ];

      const reports = createTimeReportsWithoutTags(sampleData);
      const expected = createTimeReportsWithTags([sampleData[0]]);

      let getTagsCallCount = 0;
      const database = {
        getTimeReports: () => bluebird.resolve(reports),
        getTags: () => {
          return new bluebird((resolve, reject) => {
            getTagsCallCount++;

            if (getTagsCallCount == 1) {
              resolve(['tag0']);
            } else if ( getTagsCallCount == 2 ) {
              resolve(['tag1', 'tag2']);
            } else {
              reject('should not call getTags over two times!');
            }
          });
        }
      };

      report.getReports(database, '', '', 'tag0')
        .then((actual) => {
          assert.deepEqual(actual, expected);
          done();
        })
        .catch((e) => console.log(e));
    });
  });

  describe('#addTags()', () => {
    it('should add tags to report', (done) => {
      const sampleData = [
        [1, 'desc 1', '2018-01-01', 400, ['tag0']]
      ];

      const r = createTimeReportsWithoutTags(sampleData)[0];
      const expected = createTimeReportsWithTags(sampleData)[0];

      const database = {
        getTags: () => bluebird.resolve(['tag0'])
      };

      report.addTags(database, r)
        .then((actual) => {
          assert.deepEqual(actual, expected);
          done();
        })
        .catch((e) => console.log(e));
    });
  })

  describe('#remove()', () => {
    it('should call database module\'s remove function', () => {
      let removeCalled = false;

      const database = {
        removeReport: () => { removeCalled = true; }
      };

      report.remove(database, 1);

      assert.equal(removeCalled, true);
    });
  });
});
