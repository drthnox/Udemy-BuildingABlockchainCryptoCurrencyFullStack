const Block = require("./block");
const { GENESIS_BLOCK_DATA } = require("./config");
const cryptoHash = require("./crypto-hash");

describe('Testing a Block()', () => {

  const timestamp = 'a-date';
  const data = ['blockchain', 'data'];
  const lastHash = 'foo-hash';
  const hash = 'bar-hash';
  const block = new Block({ timestamp, data, hash, lastHash });

  it('has a timestamp, data, lastHash and hash properties', () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.data).toEqual(data);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
  });

  describe('genesis()', () => {
    const genesisBlock = Block.genesis();

    it('genesis block should be a Block type', () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    it('genesis block should contain default data', () => {
      expect(genesisBlock.data).toEqual(GENESIS_BLOCK_DATA.data);
      expect(genesisBlock.timestamp).toEqual(GENESIS_BLOCK_DATA.timestamp);
      expect(genesisBlock.hash).toEqual(GENESIS_BLOCK_DATA.hash);
      expect(genesisBlock.lastHash).toEqual(GENESIS_BLOCK_DATA.lastHash);
    });
  });

  describe('mineBlock()', () => {
    const lastBlock = Block.genesis();
    const data = 'mined-data';
    const minedBlock = Block.mineBlock({ lastBlock, data });
    console.log('minedBlock', minedBlock);

    it('returns a Block instance', () => {
      expect(minedBlock instanceof Block).toBe(true);
    });

    it('sets the `data`', () => {
      expect(minedBlock.data).toEqual('mined-data');
    });

    it('sets the `timestamp`', () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });

    it('creates a SHA256 hash based on proper inputs', () => {
      expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp, lastBlock.hash, data));
    });
  });

  // describe('generateHash()', () => {

  // });

});