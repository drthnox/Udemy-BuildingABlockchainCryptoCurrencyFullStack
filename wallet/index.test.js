const { STARTING_BALANCE } = require('../config');
const Wallet = require('./index');
const { verifySignature } = require('../util');

describe('Wallet', () => {

  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('has a `balance`', () => {
    expect(wallet).toHaveProperty('balance');
    expect(wallet.balance).toBe(STARTING_BALANCE);
  });

  it('has a `publicKey`', () => {
    expect(wallet).toHaveProperty('publicKey');
    // console.log(wallet.publicKey);
  });

  describe('signing data', () => {
    const data = 'foobar';

    it('verifies a signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data)
        })
      ).toBe(true);
    });

    it('does not verify an invalid signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data)
        })
      ).toBe(false);
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data + 'X')
        })
      ).toBe(false);
    });
  });

});