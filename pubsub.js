const redis = require('redis');
const { CHANNELS } = require('./config');

// class PubSub {
//   constructor({ blockchain }) {
//     this.blockchain = blockchain;
//     this.publisher = redis.createClient();
//     this.subscriber = redis.createClient();
//     this.subscribeToChannels();
//     this.subscriber.on(
//       'message',
//       (channel, message) => this.handleMessage(channel, message)
//     );
//   }

//   handleMessage({ channel, message }) {
//     console.log(`Message received: ==${message}== on channel ${channel}`);
//     try {
//       const chain = JSON.parse(message);
//       console.log(`Parsed message: ${chain}`, chain);
//       if (channel === CHANNELS.BLOCKCHAIN) {
//         this.blockchain.replaceChain(chain);
//       }
//     } catch (err) {
//       console.error(err.message);
//     }
//   }

//   subscribeToChannels() {
//     Object.values(CHANNELS).forEach((channel) => {
//       this.subscriber.subscribe(channel);
//     });
//   }

//   publish({ channel, message }) {
//     this.publisher.publish(channel, message);
//   }

//   broadcastChain() {
//     this.publish({ channel: CHANNELS.BLOCKCHAIN, message: JSON.stringify(this.blockchain.chain) });
//   }

//   connect() {
//     this.subscriber.connect();
//     this.publisher.connect();
//   }
// }

class PubSub {

  constructor({ blockchain }) {
    this.blockchain = blockchain;
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();
    this.subscriber.on('error', err => { console.log('*Redis Subscriber Client Error: ' + err.message); });
    this.subscriber.on('connect', function () { console.log('Subscriber connected to redis instance'); });
    this.publisher.on('error', function (err) { console.log('*Redis Publisher Client Error: ' + err.message); });
    this.publisher.on('connect', function () { console.log('Publisher connected to redis instance'); });
  }

  init() {
    // this.subscriber.connect();
    // this.publisher.connect();
    this.subscribeToChannels();
    //   this.subscriber.subscribe(CHANNELS.TEST);
    //   this.subscriber.subscribe(CHANNELS.BLOCKCHAIN);
  }

  handleMessage({ channel, message }) {
    console.log(`Message received: ==${message}== on channel ${channel}`);
    try {
      const chain = JSON.parse(message);
      console.log(`Parsed message: ${chain}`, chain);
      if (channel === CHANNELS.BLOCKCHAIN) {
        this.blockchain.replaceChain(chain);
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach((channel) => {
      this.subscriber.subscribe(channel);
    });
    this.subscriber.on('message', (channel, message) => this.handleMessage(channel, message));
  }

  publish({ channel, message }) {
    try {
      console.log('publisher = ', this.publisher);
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