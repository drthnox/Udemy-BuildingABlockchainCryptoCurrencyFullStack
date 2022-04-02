const { STARTING_BALANCE } = require('../config');
const Wallet = require('./index');
const { verifySignature } = require('../util');
const Transaction = require('./transaction');
var should = require('should');

describe('Wallet', () => {

  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('has a `balance`', () => {
    wallet.should.have.property('balance');
    wallet.balance.should.be.equal(STARTING_BALANCE);
  });

  it('has a `publicKey`', () => {
    wallet.should.have.property('publicKey');
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

  describe('createTransaction()', () => {
    describe('and the amount exceeds the balance', () => {
      it('throws an error', () => {
        expect(() => wallet.createTransaction({amount:999999, recipient: 'some-recipient'})).toThrow('Amount exceeds balance');
      });
    });

    describe('and the amount is valid', () => {

      let transaction, amount, recipient;

      beforeEach(() => {
        amount = 50;
        recipient = 'some-recipient';
        transaction = wallet.createTransaction({amount, recipient});
      });

      it('creates an instance of `Transaction`', () => {
        transaction.should.be.an.instanceOf(Transaction);
      });

      it('matches the transaction input with the wallet', () => {
        transaction.input.address.should.be.equal(wallet.publicKey);
      });

      it('outputs the result to the recipient', () => {
        transaction.outputMap[recipient].should.be.equal(amount);
      });
    });
  });
});