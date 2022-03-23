const Map = require('collections/map');
// const Dict = require('collections/dict');
const { v4: uuidv4 } = require('uuid');
const { verifySignature } = require('../util');

class Transaction {
  constructor({senderWallet: senderWallet, recipient: recipient, amount: amount}) {
    this.id = uuidv4();
    this.outputMap = this.createOutputMap({
      senderWallet: senderWallet,
      recipient: recipient,
      amount: amount
    });
    this.input = this.createInputMap({
      senderWallet: senderWallet,
      outputMap: this.outputMap
    });
  }

  createInputMap({senderWallet: senderWallet, outputMap}) {
    return ({
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap)
    });
  }

  createOutputMap({senderWallet: senderWallet,recipient: recipient,amount: amount}) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    return outputMap;
  }

  static validate(transaction) {
    const {input, outputMap} = transaction;
    const {address, amount, signature} = input;
    const outputTotal = Object.values(outputMap).reduce((total, amount) => total + amount);
    if(amount !== outputTotal) {
      console.error(`Invalid transaction from ${address}`);
      return false;
    }
    if(!verifySignature({publicKey:address, data:outputMap, signature})) {
      console.error(`Invalid signature from ${address}`);
      return false;
    }
    return true;
  }
}

module.exports = Transaction;