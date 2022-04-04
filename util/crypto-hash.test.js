const { cryptoHash } = require('../util');
var should = require('should');

describe('cryptoHash()', () => {

  beforeEach(() => {
    mockConsole();
  });

  function mockConsole() {
    errMock = jest.fn();
    logMock = jest.fn();
    global.console.error = errMock;
    global.console.log = logMock;
  }

  it('generates a SHA256 hashed output', () => {
    expect(cryptoHash('foo')).toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b'.toLowerCase());
    // expect(cryptoHash('foo')).toEqual('0010110000100110101101000110101101101000111111111100011010001111111110011001101101000101001111000001110100110000010000010011010000010011010000100010110101110000011001001000001110111111101000001111100110001010010111101000100001100010011001101110011110101110');
  });

  it('produces the same hash regardless of input order', () => {
    expect(cryptoHash('foo','bar','baz')).toEqual(cryptoHash('bar','baz','foo'));
  });

  it('produces a unique hash when the properties have changed on an input', () => {
    const foo = {};
    const fooHash = cryptoHash(foo);
    foo['a'] = 'a';

    fooHash.should.not.be.equal(cryptoHash(foo));
  });

});