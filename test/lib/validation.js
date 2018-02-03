const assert = require('assert');
const validation = require('../../lib/validation');

describe('validation', () => {
  describe('#validateParams()', () => {
    describe('valid inputs', () => {
      it('should pass without parameters', () => {
        validation.validateParams({});
      });

      it('should pass with valid start date', () => {
        validation.validateParams({ start: '20180101' });
      });

      it('should pass with valid end date', () => {
        validation.validateParams({ end: '20180101' });
      });

      it('should pass with a valid hashtag', () => {
        validation.validateParams({ tag: '#aTag' });
      });

      it('should pass with a valid tag', () => {
        validation.validateParams({ tag: 'aTag' }, false);
      });
    });

    describe('invalid inputs', () => {
      it('should fail when start date contains a character', () => {
        assert.throws(() => { validation.validateParams({ start: '2018010a' }); }, Error, 'Invalid date: 2018010a');
      });

      it('should fail when end date contains a character', () => {
        assert.throws(() => { validation.validateParams({ end: '2018010a' }); }, Error, 'Invalid date: 2018010a');
      });

      it('should fail when tag contains invalid character', () => {
        assert.throws(() => { validation.validateParams({ tag: '#t.?/\a!"#€%&/()=?`^*g©@£$∞§|[]≈±´~™:;><' }); }, Error, 'Invalid tag: #t.?/\a!"#€%&/()=?`^*g©@£$∞§|[]≈±´~™:;><');
      });

      it('should fail when tag contains hash but when not expecting one', () => {
        assert.throws(() => { validation.validateParams({ tag: '#tag' }, false); }, Error, 'Invalid tag: #tag');
      });
    });
  });

  describe('#validateDateString()', () => {
    describe('valid inputs', () => {
      it('should pass with valid-ish date', () => {
        validation.validateDateString("20180101");
      });
    });

    describe('invalid inputs', () => {
      it('should fail when date contains a character', () => {
        assert.throws(() => { validation.validateDateString("2018010s"); }, Error, 'Invalid date: 2018010a');
      });
    });
  });

  describe('#validateTag()', () => {
    describe('valid inputs', () => {
      it('should pass with a valid hashtag', () => {
        validation.validateTag("#hash_-tag", true);
      });

      it('should pass with a valid tag', () => {
        validation.validateTag("hash_-tag", false);
      });
    });

    describe('invalid inputs', () => {
      it('should fail when a hashtag does not contain hash', () => {
        assert.throws(() => { validation.validateTag("hash_-tag", true); }, Error, 'Invalid tag: hash_-tag');
      });

      it('should fail when a tag does contains a hash', () => {
        assert.throws(() => { validation.validateTag("#hash_-tag", false); }, Error, 'Invalid tag: #hash_-tag');
      });
    });
  });
});
