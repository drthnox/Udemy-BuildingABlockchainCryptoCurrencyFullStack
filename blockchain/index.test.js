const Blockchain = require('./index');
const Block = require('./block');
const cryptoHash = require("../util/crypto-hash");

describe('Testing the Blockchain', () => {

  let blockchain, newChain, originalChain;

  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    originalChain = blockchain.chain;
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

    blockchain.addBlock({data: data});

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
        const bad_block = new Block({timestamp, lastHash, hash, nonce, difficulty, data});

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
    let errMock, logMock;

    beforeEach(() => {
      errMock = jest.fn();
      logMock = jest.fn();
      global.console.error = errMock;
      global.console.log = logMock;
    });

    describe('when new chain is shorter', () => {

      beforeEach(() => {
        newChain.chain[0] = {new: 'chain'};
        blockchain.replaceChain(newChain.chain);
      });

      it('should not replace the chain', () => {
        expect(blockchain.chain).toEqual(originalChain);
      });

      it('logs an error', () => {
        expect(errMock).toHaveBeenCalled();
      });

    });

    describe('when new chain is longer', () => {

      beforeEach(() => {
        newChain.addBlock({ data: 'one' });
        newChain.addBlock({ data: 'two' });
        newChain.addBlock({ data: 'three' });
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

});