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
    this.input = this.createInputMap({senderWallet: senderWallet});
  }

  createInputMap({senderWallet: senderWallet}) {
    const input = {};
    input['timestamp'] = 0;
    input['amount'] = senderWallet.balance;
    input['address'] = senderWallet.publicKey;
    return input;
  }

  createOutputMap({senderWallet: senderWallet,recipient: recipient,amount: amount}) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    return outputMap;
  }
}

module.exports = Transaction;