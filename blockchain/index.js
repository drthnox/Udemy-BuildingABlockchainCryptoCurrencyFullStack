const Block = require('./block');
const { cryptoHash } = require('../util');
const lodash = require('lodash');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');

class Blockchain {

  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data: block }) {
    const lastBlock = this.chain[this.chain.length - 1];
    const newBlock = Block.mine({
      data: block,
      lastBlock: lastBlock
    });
    this.chain.push(newBlock);
  }

  static isValidChain(chain) {
    console.log('Validating chain...');
    let block = chain[0];
    if (!lodash.isEqual(block, Block.genesis())) {
      console.error('First block is not the genesis block');
      return false;
    }
    for (let i = 1; i < chain.length; i++) {
      const { timestamp, data, hash, lastHash, nonce, difficulty } = chain[i];
      const prevBlock = chain[i - 1];
      const actualLastHash = prevBlock.hash;
      if (lastHash !== actualLastHash) {
        console.error('Hash mismatch');
        return false;
      }

      const possibleDifficultyValues = [prevBlock.difficulty - 1, prevBlock.difficulty + 1];
      if (!possibleDifficultyValues.includes(difficulty)) {
        console.error('Difficulty value out of range');
        return false;
      }

      const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
      if (hash !== validatedHash) {
        console.error('Invalid hash');
        return false;
      }
    }
    return true;
  }

  replaceChain(newChain, validateTransactions, onSuccess) {

    if (newChain.length <= this.chain.length) {
      console.error('Incoming chain is same length or shorter. Not replacing.');
      return;
    }

    if (!Blockchain.isValidChain(newChain)) {
      console.error('Incoming chain is invalid');
      return;
    }

    if(validateTransactions && !this.validateTransactionData({newChain})) {
      console.error('Invalid transaction data in incoming chain');
      return;
    }

    if (onSuccess) {
      onSuccess();
    }

    console.log('Replacing chain with ', newChain);
    this.chain = newChain;
  }

  equalTo(otherBlockchain) {
    return lodash.equalTo(this.chain, otherBlockchain.chain);
  }

  validateTransactionData({ chain }) {
    for (let i = 1; i < chain.length; i++) { // skip the genesis block
      const block = chain[i];
      let rewardTransactionCount = 0;
      const transactionSet = new Set();

      for (let transaction of block.data) {

        if (transactionSet.has(transaction)) {
          console.error('Duplicate transaction found');
          return false;
        } else {
          transactionSet.add(transaction);
        }

        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount++;

          if (rewardTransactionCount > 1) {
            console.error('Miner rewards limit exceeded');
            return false;
          }

          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error('Invalid miner reward amount');
            return false;
          }
        } else {
          if (!Transaction.validate(transaction)) {
            console.error('Invalid transaction');
            return false;
          }

          const realBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address
          });

          if (transaction.input.amount !== realBalance) {
            console.error('Invalid input amount');
            return false;
          }
        }
      }
    }
    return true;
  }
}

module.exports = Blockchain;
