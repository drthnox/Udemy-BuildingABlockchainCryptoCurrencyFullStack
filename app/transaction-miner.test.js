const TransactionMiner = require('./transaction-miner');
const Blockchain = require('../blockchain');
let should = require('should');
const TransactionPool = require('../wallet/transaction-pool');
const Wallet = require('../wallet');
const PubSub = require('./pubsub');

describe('TransactionMiner', () => {

  it('constructor', () => {
    let blockchain = new Blockchain();
    let transactionPool = new TransactionPool();
    let wallet = new Wallet();
    let pubsub = new PubSub({ blockchain, transactionPool });

    const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

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