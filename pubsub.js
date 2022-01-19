const redis = require('redis');
const Blockchain = require('./blockchain');
const {CHANNELS} = require('./config');

class PubSub {
  constructor({blockchain}) {
    this.blockchain = blockchain;
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();
    // await this.publisher.connect();
    // await this.subscriber.connect();
  }

  init() {
    this.subscriber.subscribe(CHANNELS.TEST);
    this.subscriber.subscribe(CHANNELS.BLOCKCHAIN);
    this.subscriber.on('message', (channel, message) => this.handleMessage(channel, message));
  }

  handleMessage({channel, message}) {
    console.log(`Message received: ${message} on channel ${channel}`);
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach((channel) => {
      this.subscriber.subscribe(channel);
    });
  }

  publish({channel, message}) {
    this.publisher.publish(channel, message);
  }

  reset() {
    // this.subscriber.quit();
    // this.publisher.quit();
  }

  broadcastChain() {
    this.publish({channel:CHANNELS.BLOCKCHAIN, message:this.blockchain});
  }
}

module.exports = PubSub;