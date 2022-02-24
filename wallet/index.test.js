const { STARTING_BALANCE } = require('../config');
const Wallet = require('./index');

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
    // publicKey needs to be part of apublic/private key pair
  });

});