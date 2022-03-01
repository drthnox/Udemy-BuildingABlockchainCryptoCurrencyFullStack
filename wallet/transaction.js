const { uuid } = require('uuidv4');
const Map = require('collections/map');

class Transaction {
  constructor() {
    this.id = uuid();
    this.outputMap = new Map();
  }
}

module.exports = Transaction;