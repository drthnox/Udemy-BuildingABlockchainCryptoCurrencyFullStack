const Map = require('collections/map');
const Transaction = require('./transaction');

class TransactionPool {

  constructor() {
    this.transactionMap = new Map();
  }

  addTransaction(transaction) {
    this.setTransaction(transaction);
  }

  setTransaction(transaction) {
    console.log('set transaction called', transaction.id);
    this.transactionMap.set(transaction.id, transaction);
    console.log(this.transactionMap.get(transaction.id));
  }

  getTransaction(transactionId) {
    console.log('Retriving transaction with id', transactionId);
    return this.transactionMap.get(transactionId);
  }

  transactionExists({ inputAddress }) {
    var transactions = this.transactionMap.values();

    for(let t of transactions) {
      if(t.input.address === inputAddress) {
        return t;
      }
    }

    return null;
  }

  setMap(transactionMap) {
    console.log('Replacing transaction map on a sync with', transactionMap);
    this.transactionMap = transactionMap;
  }

  validTransactions() {
    let validTransactions = [];
    let transactions = this.transactionMap.values();
    for(let t of transactions) {
      if(Transaction.validate(t)) {
        validTransactions.push(t);
      }
    }
    return validTransactions;
  }
}


module.exports = TransactionPool;