const assert = require('assert');
const util = require('../../lib/util');

describe('util', () => {
  describe('#containsLetter()', () => {
    it('should return true if input constains a letter', () => {
      assert.equal(util.containsLetter('123a€#&€#&'), true);
    });

    it('should return false if input does not contain a letter', () => {
      assert.equal(util.containsLetter('123!"€#€645756867=?+´`<-´'), false);
    });
  });

  describe('#getLetters()', () => {
    it('should return an empty array with falsy input', () => {
      assert.deepEqual(util.getLetters(''), []);
      assert.deepEqual(util.getLetters(undefined), []);
      assert.deepEqual(util.getLetters(NaN), []);
      assert.deepEqual(util.getLetters(null), []);
    });

    it('should only return letters', () => {
      assert.deepEqual(util.getLetters('123a?=^*b!>_-.,c'), ['a','b','c']);
    });
  });

  describe('#stripLetters()', () => {
    it('should return an empty string with falsy input', () => {
      assert.equal(util.stripLetters(''), '');
      assert.equal(util.stripLetters(undefined), '');
      assert.equal(util.stripLetters(NaN), '');
      assert.equal(util.stripLetters(null), '');
    });

    it('should only return letters', () => {
      assert.equal(util.stripLetters('123a?=^*b!>_-.,c'), '123?=^*!>_-.,');
    });
  });

  describe('#unique()', () => {
    it('should return an empty array with falsy input', () => {
      assert.deepEqual(util.unique(''), []);
      assert.deepEqual(util.unique(undefined), []);
      assert.deepEqual(util.unique(NaN), []);
      assert.deepEqual(util.unique(null), []);
    });

    it('should only return unique items', () => {
      assert.deepEqual(util.unique(['a', 'a', '1', 'b', '1', 2, 2, ';/', ';/']), ['a', '1', 'b', 2, ';/']);
    });
  });

  describe('#parseTags()', () => {
    it('should return an empty array with falsy input', () => {
      assert.deepEqual(util.parseTags(''), []);
      assert.deepEqual(util.parseTags(undefined), []);
      assert.deepEqual(util.parseTags(NaN), []);
      assert.deepEqual(util.parseTags(null), []);
    });

    it('should parse valid tags from a string', () => {
      assert.deepEqual(util.parseTags('word #tag1 word2 #tag-2 word #tag_3'), ['tag1', 'tag-2', 'tag_3']);
    });
  });

  describe('#take()', () => {
    it('should return an empty string with falsy input', () => {
      assert.equal(util.take(''), '');
      assert.equal(util.take(undefined), '');
      assert.equal(util.take(NaN), '');
      assert.equal(util.take(null), '');
    });

    it('should return value so that value.length === input size', () => {
      assert.equal(util.take('123456789', 3), '123');
    });

    it('should return whole input string if input size > input string length', () => {
      assert.equal(util.take('123456789', 20), '123456789');
    });

    it('should support negative size', () => {
      assert.equal(util.take('123456789', -3), '123456');
    });
  });

  describe('#parseTimeToMinutes()', () => {
    it('should parse hours and minutes separated with dot or comma', () => {
      assert.equal(util.parseTimeToMinutes('7,50'), 470);
      assert.equal(util.parseTimeToMinutes('7.50'), 470);
    });

    it('should parse hours and minutes with units', () => {
      assert.equal(util.parseTimeToMinutes('7h 50m'), 470);
      assert.equal(util.parseTimeToMinutes('7H 50M'), 470);
      assert.equal(util.parseTimeToMinutes('7hour 50min'), 470);
      assert.equal(util.parseTimeToMinutes('7Hour 50Min'), 470);
      assert.equal(util.parseTimeToMinutes('7hours 50minutes'), 470);
      assert.equal(util.parseTimeToMinutes('7Hours 50Minutes'), 470);
    });

    it('should parse space separated values without units', () => {
      assert.equal(util.parseTimeToMinutes('7 50'), 470);
    });

    it('should parse single number to minutes', () => {
      assert.equal(util.parseTimeToMinutes('30'), 30);
    });

    it('should parse zero hours', () => {
      assert.equal(util.parseTimeToMinutes('0,30'), 30);
    });

    it('should throw an error if input has units without space between', () => {
      assert.throws(() => { util.parseTimeToMinutes('7h50m') }, Error, 'Invalid time: 7h50m. Valid formats are eg. "7h 30m", 7,30, 7.30, "7 30"');
    });
  });

  describe('#convertTime()', () => {
    it('should throw an error with falsy input time', () => {
      assert.throws(() => { util.convertTime('', 'h', 'm') }, Error, 'Input time needed for conversion');
      assert.throws(() => { util.convertTime(undefined, 'h', 'm') }, Error, 'Input time needed for conversion');
      assert.throws(() => { util.convertTime(NaN, 'h', 'm') }, Error, 'Input time needed for conversion');
      assert.throws(() => { util.convertTime(null, 'h', 'm') }, Error, 'Input time needed for conversion');
    });

    it('should throw an error with falsy source time unit', () => {
      assert.throws(() => { util.convertTime('1', '', 'm') }, Error, 'Need source unit to convert time');
      assert.throws(() => { util.convertTime('1', undefined, 'm') }, Error, 'Need source unit to convert time');
      assert.throws(() => { util.convertTime('1', NaN, 'm') }, Error, 'Need source unit to convert time');
      assert.throws(() => { util.convertTime('1', null, 'm') }, Error, 'Need source unit to convert time');
    });

    it('should throw an error if target unit is not minutes', () => {
      assert.throws(() => { util.convertTime('1', 'hours', '') }, Error, 'Time conversion does not support target unit: ');
      assert.throws(() => { util.convertTime('1', 'hours', null) }, Error, 'Time conversion does not support target unit: ');
      assert.throws(() => { util.convertTime('1', 'hours', 'foo') }, Error, 'Time conversion does not support target unit: foo');
    });
  })
});
