const Map = require('collections/map');

class TransactionPool {

  constructor() {
    this.transactionMap = {};
  }

  addTransaction(transaction) {
    this.setTransaction(transaction);
  }

  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }
}


module.exports = TransactionPool;