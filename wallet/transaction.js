const { uuid } = require('uuidv4');
const Map = require('collections/map');
// const Dict = require('collections/dict');

class Transaction {
  constructor({
    senderWallet: senderWallet,
    recipient: recipient,
    amount: amount
  }) {
    this.senderWallet = senderWallet;
    this.recipient = recipient;
    this.amount = amount;
    this.id = uuid();
    this.outputMap = new Map();
    this.outputMap.add(this.amount, this.recipient);
    this.outputMap.add(this.senderWallet.balance - amount, this.senderWallet.publicKey);
  }
}

module.exports = Transaction;