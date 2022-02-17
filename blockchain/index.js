const Block = require('./block');
const cryptoHash = require("../util/crypto-hash");
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
    console.log('Validating chain...');
    let block = chain[0];
    if(!lodash.isEqual(block, Block.genesis())) {
      console.error('First block is not the genesis block');
      return false;
    }
    for (let i=1; i<chain.length;i++) {
      const {timestamp, data, hash, lastHash, nonce, difficulty}  = chain[i];
      const prevBlock = chain[i-1];
      const actualLastHash = prevBlock.hash;
      if(lastHash !== actualLastHash) {
        console.error('Hash mismatch');
        return false;
      }

      const possibleDifficultyValues = [prevBlock.difficulty - 1, prevBlock.difficulty + 1];
      if(!possibleDifficultyValues.includes(difficulty)) {
        console.error('Difficulty value out of range');
        return false;
      }

      const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
      if(hash !== validatedHash) {
        console.error('Invalid hash');
        return false;
      }
    }
    return true;
  }

  replaceChain(newChain) {
    // console.log('Attempting to replace chain');
    if(newChain.length <= this.chain.length) {
      console.error('Incoming chain is same length or shorter. Not replacing.');
      return;
    }
    if(!Blockchain.isValidChain(newChain)) {
      console.error('Incoming chain is invalid');
      return;
    }
    // console.log('replacing chain with ', newChain);
    this.chain = newChain;
  }

  equalTo(otherBlockchain) {
    return lodash.equalTo(this.chain, otherBlockchain.chain);
  }
}

module.exports = Blockchain;
