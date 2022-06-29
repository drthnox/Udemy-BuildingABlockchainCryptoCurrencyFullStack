const { length } = require('body-parser');
const Map = require('collections/map');
// const Dict = require('collections/dict');
const { v4: uuidv4 } = require('uuid');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const { verifySignature } = require('../util');

class Transaction {
  constructor({
    senderWallet,
    recipient,
    amount,
    outputMap,
    input
  }) {
    this.id = uuidv4();
    this.outputMap = outputMap || this.createOutputMap({
      senderWallet: senderWallet,
      recipient: recipient,
      amount: amount
    });
    this.input = input || this.createInputMap({
      senderWallet: senderWallet,
      outputMap: this.outputMap
    });
  }

  createInputMap({ senderWallet: senderWallet, outputMap }) {
    return ({
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap)
    });
  }

  createOutputMap({ senderWallet: senderWallet, recipient: recipient, amount: amount }) {
    let outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    return outputMap;
  }

  static validTransaction(transaction) {
    return this.validate(transaction);
  }

  static validate(transaction) {
    const { input, outputMap } = transaction;
    const { address, amount, signature } = input;
    const outputTotal = Object.values(outputMap).reduce((total, amount) => {
      return total + amount;
    });
    if (amount !== outputTotal) {
      console.error(`Invalid transaction from ${address}`);
      return false;
    }
    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`Invalid signature from ${address}`);
      return false;
    }
    return true;
  }

  update({ senderWallet, amount, recipient }) {
    const balance = this.outputMap[senderWallet.publicKey];
    if (amount > balance) {
      throw new Error('Amount exceeds balance');
    }

    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    this.outputMap[senderWallet.publicKey] = balance - amount;
    this.input = this.createInputMap({ senderWallet, outputMap: this.outputMap });
  }

  static rewardTransaction({minerWallet}) {
    return new this({
      input: REWARD_INPUT,
      outputMap: {[minerWallet.publicKey]: MINING_REWARD}
      // senderWallet: minerWallet,
      // recipient:minerWallet.address,
      // amount:minerWallet.amount
    });
  }
}

module.exports = Transaction;