const { GENESIS_BLOCK_DATA } = require("./config");
const cryptoHash = require("./crypto-hash");

class Block {
  constructor({timestamp, data, hash, lastHash}) {
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash;
    this.lastHash = lastHash;
  }

  static genesis() {
    return new this(GENESIS_BLOCK_DATA);
  }

  static mineBlock({lastBlock, data}) {
    const _timestamp = Date.now();
    return new this({
      timestamp: _timestamp,
      data: data,
      hash: cryptoHash(_timestamp, data, lastBlock.hash),
      lastHash: lastBlock.hash
    });
  }
}

module.exports = Block;
