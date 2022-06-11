const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
var should = require('should');
// const GlobalSet = require('collections/_set');
const Blockchain = require('../blockchain');

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

  describe('validTransactions()', () => {
    let validTransactions;
    let errorMock;

    beforeEach(() => {
      errorMock = jest.fn();
      global.console.error = errorMock;
      validTransactions = [];

      for (let i = 0; i < 10; i++) {
        transaction = new Transaction({
          senderWallet,
          recipient: 'any-recipient',
          amount: 30
        });

        // alter a 'random' transaction to make it invalid
        if (i % 3 === 0) {
          transaction.input.amount = 999999;
        } else if (i % 3 == 1) {
          transaction.input.signature = new Wallet().sign('foo');
        } else {
          validTransactions.push(transaction);
        }

        transactionPool.setTransaction(transaction);
      }

    });

    it('should return valid transactions', () => {
      expect(transactionPool.validTransactions()).toEqual(validTransactions);
    });

    it('should log an error for an invalid transaction', () => {
      transactionPool.validTransactions();

      expect(errorMock).toHaveBeenCalled();
    });
  });

  describe('clear()', () => {
    it('should clear the transactions', () => {
      transactionPool.clear();

      transactionPool.transactionMap.should.be.empty();
    });
  });

  describe('clearBlockchainTransactions()', () => {
    it('should only clear the pool of any existing blockchain transactions', () => {
      const blockchain = new Blockchain();
      const expectedTransactionMap = new Map();
      for (let i = 0; i < 6; i++) {
        const transaction = new Wallet().createTransaction({ recipient: 'foo', amount: 20 });
        transactionPool.setTransaction(transaction);
        if (i % 2 === 0) {
          blockchain.addBlock({ data: [transaction] });
        } else {
          expectedTransactionMap.set(transaction.id, transaction);
        }
      }

      transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });

      expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
    });
  });
});