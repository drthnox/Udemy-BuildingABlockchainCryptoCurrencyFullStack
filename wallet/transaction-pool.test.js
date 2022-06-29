const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', () => {
  let transactionPool, transaction, senderWallet;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    senderWallet = new Wallet();
    transaction = new Transaction({
      senderWallet,
      recipient: 'fake-recipient',
      amount: 50
    });
  });

  describe('setTransaction()', () => {
    it('adds a transaction', () => {
      transactionPool.setTransaction(transaction);

      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });

  describe('transactionExists()', () => {
    it('returns an existing transaction given an input address', () => {
      transactionPool.setTransaction(transaction);

      expect(transactionPool.transactionExists({ inputAddress: senderWallet.publicKey })).toBe(transaction);
    });
  });

  describe('validTransactions()', () => {
    let validTransactions, errorMock;

    beforeEach(() => {
      validTransactions = [];
      errorMock = jest.fn();
      global.console.error = errorMock;
      let retVal = createMixedTransactionPool({transactionPool, senderWallet});
      transactionPool = retVal._transactionPool;
      validTransactions = retVal._validTransactions;
    });

    it('returns valid transaction', () => {
      expect(transactionPool.validTransactions()).toEqual(validTransactions);
    });

    it('logs errors for the invalid transactions', () => {
      transactionPool.validTransactions();

      expect(errorMock).toHaveBeenCalled();
    });
  });

  describe('clear()', () => {
    it('clears the transactions', () => {
      transactionPool.clear();

      expect(transactionPool.transactionMap).toEqual({});
    });
  });

  describe('clearBlockchainTransactions()', () => {
    it('clears the pool of any existing blockchain transactions', () => {
      let blockchain = new Blockchain();
      const retVal = createValidTransactionMap({
        transactionPool: transactionPool,
        blockchain: blockchain
      });
      const expectedTransactionMap = retVal.expectedTransactionMap;
      transactionPool = retVal._transactionPool;
      blockchain = retVal._blockchain;

      transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });

      expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
    });
  });
});

const createMixedTransactionPool = ({transactionPool: _transactionPool, senderWallet: _senderWallet}) => {
  let _transaction;
  let _validTransactions = [];

  for (let i=0; i<10; i++) {
    _transaction = new Transaction({
      senderWallet: _senderWallet,
      recipient: 'any-recipient',
      amount: 30
    });

    if (i%3===0) {
      _transaction.input.amount = 999999;
    } else if (i%3===1) {
      _transaction.input.signature = new Wallet().sign('foo');
    } else {
      _validTransactions.push(_transaction);
    }

    _transactionPool.setTransaction(_transaction);
  }

  return { _transactionPool, _validTransactions };
}

const createValidTransactionMap = ({transactionPool: _transactionPool, blockchain: _blockchain}) => {
  const expectedTransactionMap = {};

  for (let i=0; i<6; i++) {
    const transaction = new Wallet().createTransaction({
      recipient: 'foo', amount: 20
    });

    _transactionPool.setTransaction(transaction);

    if (i%2===0) {
      _blockchain.addBlock({ data: [transaction] })
    } else {
      expectedTransactionMap[transaction.id] = transaction;
    }
  }

  return { expectedTransactionMap, _transactionPool, _blockchain };
}