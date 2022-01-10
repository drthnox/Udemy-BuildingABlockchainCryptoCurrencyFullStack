const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {

  it('generates a SHA256 hashed output', () => {
    // expect(cryptoHash('foo')).toEqual('2C26B46B68FFC68FF99B453C1D30413413422D706483BFA0F98A5E886266E7AE'.toLowerCase());
    expect(cryptoHash('foo')).toEqual('0010110000100110101101000110101101101000111111111100011010001111111110011001101101000101001111000001110100110000010000010011010000010011010000100010110101110000011001001000001110111111101000001111100110001010010111101000100001100010011001101110011110101110');
  });

  it('produces the same hash regardless of input order', () => {
    expect(cryptoHash('foo','bar','baz')).toEqual(cryptoHash('bar','baz','foo'));
  });

});