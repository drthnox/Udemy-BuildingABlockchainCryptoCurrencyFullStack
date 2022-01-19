const redis = require('redis');
const Blockchain = require('./blockchain');
const should = require('should');
const PubSub = require('./pubsub');
const {CHANNELS} = require('./config');

describe('PubSub()', () => {
  const blockchain = new Blockchain();
  const redisSpy = jest.spyOn(redis, 'createClient');
  const pubsub = new PubSub({blockchain});

  describe('constructor()', () => {
    it('should create a new PubSub with default attributes', () => {
      should.notEqual(pubsub.publisher, undefined);
      should.notEqual(pubsub.subscriber, undefined);
      expect(redisSpy).toBeCalled();
    });

    it('should store a copy of the blockchain passed to it', () => {
      should.notEqual(pubsub.blockchain, undefined);
    });
  });

  describe('init()', () => {
    const subscriberSpy = jest.spyOn(pubsub.subscriber, 'subscribe');
    const onMessageSpy = jest.spyOn(pubsub.subscriber, 'on');

    beforeEach(() => {
      pubsub.init();
    });

    afterEach(() => {
      // pubsub.reset();
    });

    it('should initialise by subscribing to the CHANNELS', () => {
      expect(subscriberSpy).toHaveBeenCalledWith(CHANNELS.TEST);
      expect(subscriberSpy).toHaveBeenCalledWith(CHANNELS.BLOCKCHAIN);
    });

    it('should define on message callback', () => {
      expect(onMessageSpy).toBeCalled();
    });
  });

  describe('handleMessage()', () => {
    it('should receive a message and a channel', () => {
      const logSpy = jest.spyOn(console, 'log');

      pubsub.handleMessage({channel:CHANNELS.TEST, message:'blah blah'});

      expect(logSpy).toBeCalled();
    });
  });

  describe('subscribeToChannels()', () => {
    it('should subscribe to channels', () => {
      const subscriberSpy = jest.spyOn(pubsub.subscriber, 'subscribe');

      pubsub.subscribeToChannels();

      Object.values(CHANNELS).forEach(channel => {
        expect(subscriberSpy).toHaveBeenCalledWith(channel);
      });
    });
  });

  describe('publish()', () => {
    it('should publish messages to channels', () => {
      const publisherSpy = jest.spyOn(pubsub.publisher, 'publish');
      publisherSpy.mockImplementation(({channel, message}) => {});

      pubsub.publish({channel:CHANNELS.TEST, message:'blah blah'});

      expect(publisherSpy).toHaveBeenCalledWith(CHANNELS.TEST, 'blah blah');
    });
  });

  describe('broadcastChain()', () => {
    it('should broadcast the chain', () => {
      const blockchain = new Blockchain();
      const publisherSpy = jest.spyOn(pubsub.publisher, 'publish');
      publisherSpy.mockImplementation(({channel, message}) => {});

      pubsub.broadcastChain({blockchain:blockchain});

      expect(publisherSpy).toHaveBeenCalledWith(CHANNELS.BLOCKCHAIN, blockchain);
    });
  });
});