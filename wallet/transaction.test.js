const Wallet = require('.');
const Transaction = require('./transaction');
const should = require('should');

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

});