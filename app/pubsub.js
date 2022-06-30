const redis = require('redis');
const { CHANNELS } = require('../config');


class PubSub {

  constructor({ blockchain, transactionPool, redisUrl }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.subscriber = redis.createClient(redisUrl);
    this.publisher = redis.createClient(redisUrl);
    this.init();
  }

  init() {
    this.initialiseSubscriber();
    this.initialisePublisher();
    this.subscribeToChannels();
  }

  initialisePublisher() {
    this.publisher.on('error', function (err) { console.log('*Redis Publisher Client Error: ' + err.message); });
    this.publisher.on('connect', function () { console.log('Publisher connected to redis instance'); });
  }

  initialiseSubscriber() {
    this.subscriber.on('error', err => { console.log('*Redis Subscriber Client Error: ' + err.message); });
    this.subscriber.on('connect', function () { console.log('Subscriber connected to redis instance'); });
    this.subscriber.on('message', (channel, message) => {
      this.handleMessage({ channel: channel, message: message });
    });
  }

  handleMessage({ channel, message }) {
    if (message !== undefined) {
      try {
        const parsedMessage = JSON.parse(message);
        console.log('Message received:', parsedMessage);
        switch (channel) {
          case CHANNELS.BLOCKCHAIN:
            this.blockchain.replaceChain(parsedMessage, true, () => {
              this.transactionPool.clearBlockchainTransactions({
                chain: parsedMessage
              });
            });
            break;
          case CHANNELS.TRANSACTION:
            this.transactionPool.setTransaction(parsedMessage);
            break;
          default:
            return;
        }
      } catch (error) {
        console.error(error.message);
      }
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach((channel) => {
      this.subscribe(channel);
    });
  }

  subscribe(channel) {
    this.subscriber.subscribe(channel);
  }

  publishThenSubscribe(channel, message) {
    this.publisher.publish(channel, message, () => this.subscribe(channel));
  }

  publish({ channel, message }) {
    try {
      // console.log(`Publishing ${message} on ${channel}`);
      this.skipRedundantChannel(channel, message);
    } catch (err) {
      console.error(err);
    }
  }

  skipRedundantChannel(channel, message) {
    this.subscriber.unsubscribe(channel, () => this.publishThenSubscribe(channel, message));
  }

  reset() {
    // this.subscriber.quit();
    // this.publisher.quit();
  }

  broadcastChain() {
    this.publish({ channel: CHANNELS.BLOCKCHAIN, message: JSON.stringify(this.blockchain.chain) });
  }

  broadcastTransaction(transaction) {
    this.publish({ channel: CHANNELS.TRANSACTION, message: JSON.stringify(transaction) });
  }
}

module.exports = PubSub;