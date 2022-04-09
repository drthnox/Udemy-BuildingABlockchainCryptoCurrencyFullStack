const Map = require('collections/map');

class TransactionPool {

  constructor() {
    this.transactionMap = new Map();
  }

  addTransaction(transaction) {
    this.setTransaction(transaction);
  }

  setTransaction(transaction) {
    this.transactionMap.set(transaction.id, transaction);
    console.log(this.transactionMap.get(transaction.id));
  }

  getTransaction(transactionId) {
    console.log(this.transactionMap[transactionId]);
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
}


module.exports = TransactionPool;