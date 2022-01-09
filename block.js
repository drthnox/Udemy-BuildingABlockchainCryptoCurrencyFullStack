const { GENESIS_BLOCK_DATA, MINE_RATE_IN_MILLIS } = require("./config");
const cryptoHash = require("./crypto-hash");
const lodash = require('lodash');

class Block {
  constructor({ timestamp, data, hash, lastHash, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash;
    this.lastHash = lastHash;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static genesis() {
    return new this(GENESIS_BLOCK_DATA);
  }

  static mineBlock({ lastBlock, data }) {
    const lastHash = lastBlock.hash;
    const difficulty = lastBlock.difficulty;
    let nonce = 0;
    let hash, timestamp;

    do {
      nonce++;
      timestamp = Date.now();
      hash = cryptoHash(timestamp, data, lastHash, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));
    return new this({
      timestamp: timestamp,
      data: data,
      hash: hash,
      lastHash: lastHash,
      nonce: nonce,
      difficulty: difficulty
    });
  }

  isEqual(otherBlock) {
    return lodash.isEqual(this, otherBlock);
  }

  isGenesis() {
    return lodash.isEqual(this, Block.genesis())
  }

  static adjustDifficulty({ originalBlock, timestamp }) {
    const {difficulty} = originalBlock;
    const difference = timestamp - originalBlock.timestamp;
    let adjustedDifficulty = difficulty;
    if (difference > MINE_RATE_IN_MILLIS) {
      // block mined too slowly, so lower the difficulty
      adjustedDifficulty -= 1;
    } else {
      // block mined too quickly, so increase the difficulty
      adjustedDifficulty += 1;
    }
    return adjustedDifficulty;
  }
}

module.exports = Block;
