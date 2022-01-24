const redis = require('redis');
const Blockchain = require('./blockchain');
const { CHANNELS } = require('./config');


class PubSub {

  constructor({ blockchain }) {
    this.blockchain = blockchain;
    this.subscriber = redis.createClient();
    this.publisher = redis.createClient();
    this.init();
  }

  init() {
    this.subscriber.on('error', err => { console.log('*Redis Subscriber Client Error: ' + err.message); });
    this.subscriber.on('connect', function () { console.log('Subscriber connected to redis instance'); });
    this.subscriber.on('message', (channel, message) => {
      console.log(`${channel}: ${message}`);
      this.handleMessage({channel:channel, message:message});}
    );
    this.publisher.on('error', function (err) { console.log('*Redis Publisher Client Error: ' + err.message); });
    this.publisher.on('connect', function () { console.log('Publisher connected to redis instance'); });
    this.subscribeToChannels();
  }

  handleMessage({ channel, message }) {
    console.log(`Message received: ==${message}== on channel ${channel}`);
    try {
      const parsedMessage = JSON.parse(message);
      console.log(`Parsed message: ${parsedMessage}`, parsedMessage);
      if (channel === CHANNELS.BLOCKCHAIN) {
        this.blockchain.replaceChain(parsedMessage);
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach((channel) => {
      this.subscriber.subscribe(channel);
    });
  }

  publish({ channel, message }) {
    try {
      console.log(`Publishing ${message} on ${channel}`);
      this.publisher.publish(channel, message);
    } catch (err) {
      console.error(err);
    }
  }

  reset() {
    // this.subscriber.quit();
    // this.publisher.quit();
  }

  broadcastChain() {
    this.publish({ channel: CHANNELS.BLOCKCHAIN, message: JSON.stringify(this.blockchain.chain) });
  }
}

module.exports = PubSub;