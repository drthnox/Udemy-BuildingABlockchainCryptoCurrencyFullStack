const { add } = require('lodash');
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

  createTransaction({ amount, recipient, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({ chain: chain, address: this.publicKey });
    }

    if (amount > this.balance) {
      throw new Error('Amount exceeds balance');
    }

    const txn = new Transaction({
      senderWallet: this,
      recipient: recipient,
      amount: amount
    });
    console.log('wallet created', txn);
    return txn;
  }

  static calculateBalance({ chain, address }) {
    let balance = 0;
    let hasConductedTransaction = false;

    for (let i = chain.length-1; i > 0; i--) {
      const block = chain[i];
      for (let transaction of block.data) {

        if(transaction.input.address === address) {
          hasConductedTransaction = true;
        }

        const addressOutput = transaction.outputMap[address];

        if (addressOutput) {
          balance += addressOutput;
        }
      }

      if(hasConductedTransaction) {
        break;
      }

    }

    return hasConductedTransaction ? balance : STARTING_BALANCE + balance;
  }

}

module.exports = Wallet;