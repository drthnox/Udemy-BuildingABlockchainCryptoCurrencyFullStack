const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
var should = require('should');

describe('TransactionPool', () => {

  let transactionPool, transaction;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    transaction = new Transaction({
      senderWallet: new Wallet(),
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
      console.log('>>>> ', transactionPool.transactionMap.get(transaction.id));
      transactionPool.transactionMap.get(transaction.id).should.be.equal(transaction);
    });
  });

  describe('transactionExists()', () => {

    beforeEach(() => {
      transactionPool.addTransaction(transaction);
    });

    it('should contain a transaction with a given input address', () => {
      const inputAddress = transaction.input.address;
      console.log(inputAddress);

      transactionPool.transactionExists({ inputAddress }).should.not.be.null();
    });

    it('should not contain any transaction with non-existent input address', () => {
      const inputAddress = 99999;
      console.log(inputAddress);

      expect(transactionPool.transactionExists({ inputAddress })).toEqual(null);
    });
  });
});