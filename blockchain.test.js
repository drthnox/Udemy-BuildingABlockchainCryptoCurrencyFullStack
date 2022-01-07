const Blockchain = require('./blockchain');
const Block = require('./block');
const { GENESIS_BLOCK_DATA } = require('./config');

describe('Testing the Blockchain', () => {

  let blockchain;

  beforeEach(() => {
    blockchain = new Blockchain();
  });

  it('should be an instance of Blockchain', () => {
    expect(blockchain instanceof Blockchain).toBe(true);
  });

  it('should contain a chain array', () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it('should start with the genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
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

    describe('and the chain contains only valid blocks', () => {
      it('should return true', () => {
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
      });
    });

  });

});