const redis = require('redis');

const CHANNELS = {
  TEST: 'TEST'
};

class PubSub {
  constructor() {
    this.publisher = PubSub.createClient();
    this.subscriber = PubSub.createClient();
  }


  static createClient(client) {
    return redis.createClient();
  }
}

module.exports = PubSub;