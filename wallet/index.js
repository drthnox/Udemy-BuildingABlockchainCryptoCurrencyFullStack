const { STARTING_BALANCE } = require('../config');
const { cryptoHash } = require('../util');
const { ec }  = require('../util');
const Transaction = require('./transaction');

class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }

  createTransaction({amount, recipient}) {
    return new Transaction({
      senderWallet: this,
      recipient: recipient,
      amount: amount
    });
  }

}

module.exports = Wallet;