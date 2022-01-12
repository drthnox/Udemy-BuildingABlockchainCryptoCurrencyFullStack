const redis = require('redis');

const CHANNELS = {
  TEST: 'TEST'
};

class PubSub {
  constructor() {
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();
  }

  init() {
    this.subscriber.subscribe(CHANNELS.TEST);
    this.subscriber.on('message', (channel, message) => this.handleMessage(channel, message));
  }
}

module.exports = PubSub, CHANNELS;