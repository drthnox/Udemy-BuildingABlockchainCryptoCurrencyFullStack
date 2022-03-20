const Wallet = require('.');
const Transaction = require('./transaction');
const should = require('should');
const version = require('nodemon/lib/version');
const { verifySignature } = require('../util');

describe('Transaction', () => {
  let transaction,
    senderWallet,
    recipient,
    amount;

  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = 'recipient-public-key';
    amount = 50;

    transaction = new Transaction({
      senderWallet,
      recipient,
      amount
    });
  });

  it('should have an `id`', () => {
    transaction.should.have.property('id');
  });

  describe('outputMap', () => {
    it('has an `outputMap`', () => {
      transaction.should.have.property('outputMap');
    });

    it('outputs the `amount` to the `recipient`', () => {
      transaction.outputMap.should.have.value(recipient, amount);
    });

    it('outputs the remaining balance for the `senderWallet`', () => {
      transaction.outputMap.should.have.value(senderWallet.publicKey, senderWallet.balance - amount);
    });
  });

  describe('input', () => {
    it('has an `input`', () => {
      transaction.should.have.property('input');
    });

    it('has a `timestamp` in the input', () => {
      (transaction.input).should.have.property('timestamp');
    });

    it('sets the `amount` to the `senderWallet` balance', () => {
      (transaction.input).should.have.property('amount', senderWallet.balance);
    });

    it('sets the `address` to the `senderWallet` publicKey', () => {
      (transaction.input).should.have.property('address', senderWallet.publicKey);
    });

    it('signs the input', () => {
      verifySignature({
        publicKey: senderWallet.publicKey,
        data: transaction.outputMap,
        signature: transaction.input.signature
      }).should.be.true();
    });
  });
});