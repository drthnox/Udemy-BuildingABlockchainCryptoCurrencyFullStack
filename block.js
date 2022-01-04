const { GENESIS_BLOCK_DATA } = require("./config");

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
    return new this({
      timestamp: Date.now(),
      data: data,
      lastHash: lastBlock.hash
    });
  }
}

module.exports = Block;
