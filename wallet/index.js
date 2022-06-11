const { STARTING_BALANCE } = require('../config');
const { cryptoHash } = require('../util');
const { ec } = require('../util');
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

  createTransaction({ amount, recipient }) {
    if (amount > this.balance) {
      throw new Error('Amount exceeds balance');
    }
    const txn = new Transaction({
      senderWallet: this,
      recipient: recipient,
      amount: amount
    });
    console.log('wallet created new transaction', txn);
    return txn;
  }

  static calculateBalance({ chain, address }) {
    let balance = 0;

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      for (let transaction of block.data) {
        const addressOutput = transaction.outputMap[address];
        if(addressOutput) {
          balance += addressOutput;
        }
      }
    }

    return STARTING_BALANCE + balance;
  }

}

module.exports = Wallet;