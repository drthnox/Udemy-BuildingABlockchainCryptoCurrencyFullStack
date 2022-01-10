const Block = require('./block');
const cryptoHash = require("./crypto-hash");
const lodash = require('lodash');

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
    if(!lodash.isEqual(block, Block.genesis())) {
      return false;
    }
    for (let i=1; i<chain.length;i++) {
      const {timestamp, data, hash, lastHash, nonce, difficulty}  = chain[i];
      const prevBlock = chain[i-1];
      const actualLastHash = prevBlock.hash;
      if(lastHash !== actualLastHash) {
        return false;
      }

      const possibleDifficultyValues = [prevBlock.difficulty - 1, prevBlock.difficulty + 1];
      if(!possibleDifficultyValues.includes(difficulty)) {
        return false;
      }

      const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
      if(hash !== validatedHash) {
        return false;
      }
    }
    return true;
  }

  replaceChain(newChain) {
    if(newChain.length <= this.chain.length) {
      console.error('Incoming chain must be longer');
      return;
    }
    if(!Blockchain.isValidChain(newChain)) {
      console.error('Incoming chain must be valid');
      return;
    }
    console.log('replacing chain with ', newChain);
    this.chain = newChain;
  }

  equalTo(otherBlockchain) {
    return lodash.equalTo(this.chain, otherBlockchain.chain);
  }
}

module.exports = Blockchain;
