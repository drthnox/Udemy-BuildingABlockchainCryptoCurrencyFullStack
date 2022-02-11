const Blockchain = require('./blockchain');
const should = require('should');
const PubSub = require('./pubsub');
const { CHANNELS } = require('./config');
const redis = require('redis');
const { RedisClient } = require('redis-mock');

describe('PubSub()', () => {

  const blockchain = new Blockchain();

  describe('constructor()', () => {
    it('should create a new PubSub with default attributes', () => {
      const redisSpy = jest.spyOn(redis, 'createClient');

      const pubsub = new PubSub({ blockchain });

      should.notEqual(pubsub.publisher, undefined);
      should.notEqual(pubsub.subscriber, undefined);
      expect(redisSpy).toBeCalled();
      should.notEqual(pubsub.blockchain, undefined);
    });
  });

  describe('init()', () => {
    const pubsub = new PubSub({ blockchain });
    const subscriberSpy = jest.spyOn(pubsub.subscriber, 'subscribe');
    const onMessageSpy = jest.spyOn(pubsub.subscriber, 'on');

    it('should initialise by subscribing to the CHANNELS', async () => {
      pubsub.init();

      expect(subscriberSpy).toHaveBeenCalledWith(CHANNELS.TEST);
      expect(subscriberSpy).toHaveBeenCalledWith(CHANNELS.BLOCKCHAIN);
      expect(onMessageSpy).toBeCalled();
    });
  });

  describe('handleMessage()', () => {

    const pubsub = new PubSub({ blockchain });

    let errMock, logMock;

    beforeEach(() => {
      errMock = jest.fn();
      logMock = jest.fn();
      global.console.error = errMock;
      global.console.log = logMock;
    });

    it('should not attempt to replace the chain if a badly-formatted message is received on the BLOCKCHAIN channel', () => {
      pubsub.handleMessage({ channel: CHANNELS.BLOCKCHAIN, message: 'blah blah' });

      expect(errMock).toHaveBeenCalledWith('Unexpected token b in JSON at position 0');
    });

    it('should attempt to replace the chain if a message is received on the BLOCKCHAIN channel', () => {
      const blockchainSpy = jest.spyOn(blockchain, 'replaceChain');
      const parseSpy = jest.spyOn(JSON, 'parse');

      pubsub.handleMessage({ channel: CHANNELS.BLOCKCHAIN, message: JSON.stringify(blockchain.chain)});

      expect(parseSpy).toHaveBeenCalledWith(JSON.stringify(blockchain.chain));
      expect(blockchainSpy).toHaveBeenCalledWith(blockchain.chain);
      expect(errMock).toHaveBeenCalledWith('Incoming chain must be longer');
    });
  });

  describe('subscribeToChannels()', () => {

    it('should subscribe to channels', () => {
      const pubsub = new PubSub({ blockchain });
      const subscriberSpy = jest.spyOn(pubsub.subscriber, 'subscribe');

      pubsub.subscribeToChannels();

      Object.values(CHANNELS).forEach(channel => {
        expect(subscriberSpy).toHaveBeenCalledWith(channel);
      });
    });
  });

  describe('Publishing to channels', () => {
    const pubsub = new PubSub({ blockchain });
    const unsubscriberSpy = jest.spyOn(pubsub.subscriber, 'unsubscribe');

    describe('publish()', () => {

      it('should not publish to itself', () => {
        pubsub.publish({ channel: CHANNELS.TEST, message: 'blah blah' });

        expect(unsubscriberSpy).toHaveBeenCalledWith(CHANNELS.TEST, expect.any(Function));
      });
    });

    describe('broadcastChain()', () => {
      it('should broadcast the chain', () => {
        pubsub.broadcastChain();

        expect(unsubscriberSpy).toHaveBeenCalledWith(CHANNELS.BLOCKCHAIN, expect.any(Function));
      });
    });
  });
});