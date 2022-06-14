const Blockchain = require('./index');
const Block = require('./block');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');
const { cryptoHash } = require('../util');
var should = require('should');


describe('Testing the Blockchain', () => {

  let blockchain, newChain, originalChain, errMock, logMock;

  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    originalChain = blockchain.chain;
    errMock = jest.fn();
    logMock = jest.fn();
    global.console.error = errMock;
    global.console.log = logMock;
  });

  it('should be an instance of Blockchain', () => {
    expect(blockchain instanceof Blockchain).toBe(true);
  });
  it('should contain a chain array', () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it('should start with the genesis block', () => {
    expect(blockchain.chain[0].isEqual(Block.genesis()));
    // expect(blockchain.chain[0]).toEqual(Block.genesis());
    expect(blockchain.chain.length).toEqual(1);
  });

  it('should add a new block to the chain', () => {
    const data = 'new data';

    blockchain.addBlock({ data: data });

    expect(blockchain.chain.length).toEqual(2);
    expect(blockchain.chain[1].data).toEqual(data);
  });

  describe('isValidChain()', () => {
    describe('when the chain does not start with the genesis block', () => {
      it('should return false', () => {
        blockchain.chain[0].data = 'fake-data';

        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });

    describe('when the chain does start with the genesis block and has multiple blocks', () => {

      beforeEach(() => {
        blockchain.addBlock({ data: 'one' });
        blockchain.addBlock({ data: 'two' });
        blockchain.addBlock({ data: 'three' });
      });

      describe('and `lastHash` reference has changed', () => {
        it('should return false', () => {
          blockchain.chain[2].lastHash = 'invalid lashHash';

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain contains a block with an invalid field', () => {
        it('should return false', () => {
          blockchain.chain[2].data = 'three hundred';

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
    });

    describe('and the chain contains a jumped difficulty', () => {
      it('should return false', () => {

        // get the last block
        const lastBlock = blockchain.chain[blockchain.chain.length - 1];

        // create a bad block with a jumped difficulty
        const lastHash = lastBlock.hash;
        const timestamp = Date.now();
        const nonce = 0;
        const data = [];
        const difficulty = lastBlock.difficulty - 3;
        const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
        const bad_block = new Block({ timestamp, lastHash, hash, nonce, difficulty, data });

        // add the bad block to the chain
        blockchain.chain.push(bad_block);

        const isValid = Blockchain.isValidChain(blockchain.chain);

        expect(isValid).toBe(false);
      });
    });

    describe('and the chain contains only valid blocks', () => {

      it('should return true', () => {
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
      });

    });

  });

  describe('replaceChain()', () => {

    let wallet;

    describe('when new chain is shorter', () => {

      beforeEach(() => {
        wallet = new Wallet();
        newChain.addBlock({data: [
          wallet.createTransaction({
            amount: 50,
            recipient: 'foo-recipient'
          })
        ]});

        // newChain.chain[0] = { new: 'chain' };
        blockchain.replaceChain(newChain.chain);
      });

      it('should not replace the chain', () => {
        expect(blockchain.chain).toEqual(originalChain);
      });

      it('log an error', () => {
        expect(errMock).toHaveBeenCalled();
      });

    });

    describe('when new chain is longer', () => {

      let t1, t2, t3;

      beforeEach(() => {
        t1 = wallet.createTransaction({ amount: 10, recipient: 'foo-one'});
        t2 = wallet.createTransaction({ amount: 10, recipient: 'foo-two'});
        t3 = wallet.createTransaction({ amount: 10, recipient: 'foo-three'});
        newChain.addBlock({ data: [t1] });
        newChain.addBlock({ data: [t2] });
        newChain.addBlock({ data: [t3] });
      });

      describe('and the new chain is invalid', () => {

        beforeEach(() => {
          newChain.chain[2].hash = 'some-fake-hash';
          blockchain.replaceChain(newChain.chain);
        });

        it('should not replace the chain', () => {
          expect(blockchain.chain).toEqual(originalChain);
        });

      });

      describe('and the new chain is valid', () => {

        beforeEach(() => {
          blockchain.replaceChain(newChain.chain);
        });

        it('should replace the chain', () => {
          expect(blockchain.chain).toEqual(newChain.chain);
        });

        it('logs about the chain replacement', () => {
          expect(logMock).toHaveBeenCalled();
        });

      });
    });

  });

  describe('validateTransactionData', () => {

    let transaction, wallet, rewardTransaction;

    beforeEach(() => {
      wallet = new Wallet();
      transaction = wallet.createTransaction({
        recipient: 'foo-address',
        amount: 65
      });
      rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
    });

    describe('when the transaction data is valid', () => {
      it('should return true', () => {
        newChain.addBlock({ data: [transaction, rewardTransaction] });

        blockchain.validateTransactionData({ chain: newChain.chain }).should.be.equal(true);

        expect(errMock).not.toBeCalled();
      });
    });

    describe('when the transaction data has multiple rewards', () => {
      it('should return false and log an error', () => {
        newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });

        blockchain.validateTransactionData({ chain: newChain.chain }).should.be.equal(false);

        expect(errMock).toBeCalled();
      });
    });

    describe('when the transaction has one malformed outputMap', () => {
      describe('and the transaction is a reward transaction', () => {
        it('should return false and log an error', () => {
          rewardTransaction.outputMap[wallet.publicKey] = 123456;
          newChain.addBlock({ data: [transaction, rewardTransaction] });

          blockchain.validateTransactionData({ chain: newChain.chain }).should.be.equal(false);

          expect(errMock).toBeCalled();
        });
      });

      describe('and the transaction is not a reward transaction', () => {
        it('should return false and log an error', () => {
          transaction.outputMap[wallet.publicKey] = 999999;
          newChain.addBlock({data: [transaction, rewardTransaction]});

          blockchain.validateTransactionData({ chain: newChain.chain }).should.be.equal(false);

          expect(errMock).toBeCalled();
        });
      });
    });

    describe('when the transaction data has at least one malformed input', () => {
      it('should return false and log an error', () => {
        wallet.balance = 9000;
        const badOutputMap = {
          [wallet.publicKey]: 8900,
          fooRecipient: 100
        };
        const badTransaction = {
          input: {
            timestamp: Date.now(),
            amount: wallet.balance,
            address: wallet.publicKey,
            signature: wallet.sign(badOutputMap)
          },
          outputMap: badOutputMap
        };
        newChain.addBlock({data: [badTransaction, rewardTransaction]});

        blockchain.validateTransactionData({ chain: newChain.chain }).should.be.equal(false);

        expect(errMock).toBeCalled();
      });
    });

    describe('when a block contains multiple identical transactions', () => {
      it('should return false and log an error', () => {
        newChain.addBlock({data: [transaction, transaction]});

        blockchain.validateTransactionData({ chain: newChain.chain }).should.be.equal(false);

        expect(errMock).toBeCalled();
      });

      it('should return false and log an error', () => {
        newChain.addBlock({data: [transaction, transaction, transaction]});

        blockchain.validateTransactionData({ chain: newChain.chain }).should.be.equal(false);

        expect(errMock).toBeCalled();
      });
    });

  });

});
