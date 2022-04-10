const TransactionMiner = require('./transaction-miner');
const Blockchain = require('../blockchain');
let should = require('should');
const TransactionPool = require('../wallet/transaction-pool');
const Wallet = require('../wallet');
const PubSub = require('./pubsub');

describe('TransactionMiner', () => {

  let blockchain;
  let transactionPool;
  let wallet;
  let pubsub;
  let transactionMiner;

  beforeEach(() => {
    blockchain = new Blockchain();
    transactionPool = new TransactionPool();
    wallet = new Wallet();
    pubsub = new PubSub({ blockchain, transactionPool });
    transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });
  });

  it('constructor', () => {
    transactionMiner.should.be.instanceOf(TransactionMiner);
    transactionMiner.should.have.property('blockchain');
    transactionMiner.should.have.property('transactionPool');
    transactionMiner.should.have.property('wallet');
    transactionMiner.should.have.property('pubsub');
    transactionMiner.blockchain.should.be.instanceOf(Blockchain);
    transactionMiner.transactionPool.should.be.instanceOf(TransactionPool);
    transactionMiner.wallet.should.be.instanceOf(Wallet);
    transactionMiner.pubsub.should.be.instanceOf(PubSub);
  });

  describe('mineTransactions()', () => {

  });

});