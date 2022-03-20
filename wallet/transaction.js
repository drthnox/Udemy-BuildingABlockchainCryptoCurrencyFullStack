const Map = require('collections/map');
// const Dict = require('collections/dict');
const { v4: uuidv4 } = require('uuid');

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
}

module.exports = Transaction;