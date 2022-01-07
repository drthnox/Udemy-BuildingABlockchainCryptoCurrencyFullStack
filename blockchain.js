const Block = require('./block');
const cryptoHash = require("./crypto-hash");

class Blockchain {

  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data }) {
    const lastBlock = this.chain[this.chain.length - 1];
    const newBlock = Block.mineBlock({
      data: data,
      lastBlock: lastBlock
    });
    this.chain.push(newBlock);
  }

  static isValidChain(chain) {
    let block = chain[0];
    if (!block.isGenesis()) {
      return false;
    }
    for (let i=1; i<chain.length;i++) {
      const {timestamp, data, hash, lastHash}  = chain[i];
      const prevBlock = chain[i-1];
      const actualLastHash = prevBlock.lastHash;
      if(lastHash !== actualLastHash) {
        return false;
      }
      const validatedHash = cryptoHash(timestamp, lastHash, data);
      if(hash !== validatedHash) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Blockchain;
