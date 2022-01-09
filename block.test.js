const Block = require("./block");
const { GENESIS_BLOCK_DATA, MINE_RATE_IN_MILLIS, MINE_RATE_ADJUSTMENT_IN_MILLIS } = require("./config");
const cryptoHash = require("./crypto-hash");

describe('Testing a Block()', () => {

  const timestamp = 2000;
  const data = ['blockchain', 'data'];
  const lastHash = 'foo-hash';
  const hash = 'bar-hash';
  const nonce = GENESIS_BLOCK_DATA.nonce;
  const difficulty = GENESIS_BLOCK_DATA.difficulty;
  const block = new Block({
    timestamp: timestamp,
    data: data,
    hash: hash,
    lastHash: lastHash,
    nonce: nonce,
    difficulty: difficulty
  });

  it('has a timestamp, data, lastHash and hash properties', () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.data).toEqual(data);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.nonce).toEqual(nonce);
    expect(block.difficulty).toEqual(difficulty);
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
      expect(genesisBlock.nonce).toEqual(GENESIS_BLOCK_DATA.nonce);
      expect(genesisBlock.difficulty).toEqual(GENESIS_BLOCK_DATA.difficulty);
    });
  });

  describe('mineBlock()', () => {
    const lastBlock = Block.genesis();
    const data = 'mined-data';
    const minedBlock = Block.mineBlock({ lastBlock, data });

    it('returns a Block instance', () => {
      expect(minedBlock instanceof Block).toBe(true);
    });

    it('sets the `data`', () => {
      expect(minedBlock.data).toEqual('mined-data');
    });

    it('sets the `timestamp`', () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });

    it('sets the `nonce`', () => {
      expect(minedBlock.nonce).not.toEqual(undefined);
    });

    it('sets the `dificulty`', () => {
      expect(minedBlock.difficulty).not.toEqual(undefined);
    });

    it('creates a SHA256 hash based on proper inputs', () => {
      expect(minedBlock.hash).toEqual(
        cryptoHash(
          minedBlock.timestamp,
          minedBlock.nonce,
          minedBlock.difficulty,
          lastBlock.hash,
          data));
    });

    it('sets the `hash` that matches the difficulty criteria', () => {
      minedBlock.difficulty = GENESIS_BLOCK_DATA.difficulty;

      expect(minedBlock.hash.substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
    });
  });

  describe('isEqual()', () => {

    var block1, block2;

    beforeEach(() => {
      block1 = Block.genesis();
      block2 = Block.genesis();
    });

    it('should return true', () => {
      expect(block1.isEqual(block2)).toBe(true);
    });

    it('should return false', () => {
      block1.data = block1.data + '###';

      expect(block1.isEqual(block2)).toBe(false);
    });
  });

  describe('isGenesis()', () => {

    const genesisBlock = Block.genesis();

    it('should return true', () => {
      expect(genesisBlock.isGenesis()).toBe(true);
    });

    it('should return false', () => {
      const block = Block.mineBlock({
        lastBlock: Block.genesis(),
        data: 'some-data'
      });

      expect(block.isGenesis()).toBe(false);
    });
  });

  describe('adjustDifficulty()', () => {

    it('should increase difficulty for a quickly mined block', () => {
      expect(Block.adjustDifficulty({
        originalBlock: block,
        timestamp: block.timestamp + MINE_RATE_IN_MILLIS - MINE_RATE_ADJUSTMENT_IN_MILLIS
      })).toEqual(block.difficulty + 1);
    });

    it('should decrease difficulty for a slowly mined block', () => {
      expect(Block.adjustDifficulty({
        originalBlock: block,
        timestamp: block.timestamp + MINE_RATE_IN_MILLIS + MINE_RATE_ADJUSTMENT_IN_MILLIS
      })).toEqual(block.difficulty - 1);
    });
  });
});