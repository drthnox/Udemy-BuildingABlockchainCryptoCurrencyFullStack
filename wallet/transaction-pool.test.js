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

      transactionPool.transactionMap[transaction.id].should.be.equal(transaction);
    });
  });

});