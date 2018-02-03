const assert = require('assert');
const env = require('../../lib/env');

describe('env', () => {
  describe('#getEnv()', () => {
    it('env should have dbFilePath variable', () => {
      assert.equal(env.getEnv().hasOwnProperty('dbFilePath'), true);
    });
  });
});
