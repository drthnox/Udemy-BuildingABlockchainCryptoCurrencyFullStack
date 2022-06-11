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

  clear() {
    this.transactionMap.clear();
  }

  clearBlockchainTransactions({chain}) {
    for(let i=1;i<chain.length; i++) { // Skip the genesis block (0)
      const block = chain[i];
      for(let transaction of block.data) {
        console.log('Checking transaction', transaction.id);
        if(this.transactionMap.get(transaction.id)) {
          console.log('Deleting', transaction.id);
          this.transactionMap.delete(transaction.id);
        }
      }
    }
  }
}


module.exports = TransactionPool;