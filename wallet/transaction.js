const { uuid } = require('uuidv4');
const Map = require('collections/map');
// const Dict = require('collections/dict');

class Transaction {
  constructor({senderWallet: senderWallet, recipient: recipient, amount: amount}) {
    this.id = uuid();
    this.outputMap = this.createOutputMap({
      senderWallet: senderWallet,
      recipient: recipient,
      amount: amount
    });
    this.input = {};
    this.input['timestamp'] = 0;
    this.input[amount] = senderWallet.balance;
  }

  createOutputMap({senderWallet: senderWallet,recipient: recipient,amount: amount}) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    return outputMap;
  }
}

module.exports = Transaction;