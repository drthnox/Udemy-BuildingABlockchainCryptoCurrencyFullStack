const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
var should = require('should');

describe('TransactionPool', () => {

  let transactionPool, transaction, senderWallet;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    senderWallet = new Wallet();
    transaction = new Transaction({
      senderWallet: senderWallet,
      recipient: 'fake-recipient',
      amount: 50
    });
  });

  describe('constructor()', () => {
    it('should have a transaction map', () => {
      transactionPool.should.have.property('transactionMap');
    });
  });

  describe('addTransaction()', () => {
    it('should add a new transaction to the transaction pool', () => {
      transactionPool.addTransaction(transaction);

      transactionPool.transactionMap.get(transaction.id).should.be.equal(transaction);
    });
  });

  describe('transactionExists()', () => {

    beforeEach(() => {
      transactionPool.setTransaction(transaction);
    });

    it('should return an existing transaction with a given input address', () => {
      transactionPool.transactionExists({ inputAddress: senderWallet.publicKey }).should.be.equal(transaction);
    });

    it('should return null for any non-existent input address', () => {
      const inputAddress = 99999;

      expect(transactionPool.transactionExists({ inputAddress })).toEqual(null);
    });
  });
});