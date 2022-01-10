const { GENESIS_BLOCK_DATA, MINE_RATE_IN_MILLIS } = require("./config");
const cryptoHash = require("./crypto-hash");
const lodash = require('lodash');
const hexToBinary = require('hex-to-binary');

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
    let {difficulty} = lastBlock;
    let nonce = 0;
    let hash, timestamp;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({originalBlock: lastBlock, timestamp});
      hash = cryptoHash(timestamp, data, lastHash, nonce, difficulty);
    } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));
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
      if(adjustedDifficulty < 1) {
        adjustedDifficulty = 1;
      }
    } else {
      // block mined too quickly, so increase the difficulty
      adjustedDifficulty += 1;
    }
    return adjustedDifficulty;
  }
}

module.exports = Block;
