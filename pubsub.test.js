const Blockchain = require('./blockchain');
const should = require('should');
const PubSub = require('./pubsub');
const { CHANNELS } = require('./config');
const redis = require('redis');

describe('PubSub()', () => {

  describe('constructor()', () => {
    it('should create a new PubSub with default attributes', () => {
      const blockchain = new Blockchain();
      const redisSpy = jest.spyOn(redis, 'createClient');

      const pubsub = new PubSub({ blockchain });

      should.notEqual(pubsub.publisher, undefined);
      should.notEqual(pubsub.subscriber, undefined);
      expect(redisSpy).toBeCalled();
    });

    it('should store a copy of the blockchain passed to it', () => {
      const blockchain = new Blockchain();

      const pubsub = new PubSub({ blockchain });

      should.notEqual(pubsub.blockchain, undefined);
    });
  });

  describe('init()', () => {
    const blockchain = new Blockchain();
    const pubsub = new PubSub({ blockchain });
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

    it('should not attempt to replace the chain if a badly-formatted message is received on the BLOCKCHAIN channel', () => {
      const blockchain = new Blockchain();
      const pubsub = new PubSub({ blockchain });
      const errSpy = jest.spyOn(console, 'error');

      pubsub.handleMessage({ channel: CHANNELS.BLOCKCHAIN, message: 'blah blah' });

      expect(errSpy).toHaveBeenCalledWith('Unexpected token b in JSON at position 0');
    });

    it('should attempt to replace the chain if a message is received on the BLOCKCHAIN channel', () => {
      const blockchain = new Blockchain();
      const pubsub = new PubSub({ blockchain });
      const blockchainSpy = jest.spyOn(blockchain, 'replaceChain');
      const parseSpy = jest.spyOn(JSON, 'parse');
      const errSpy = jest.spyOn(console, 'error');
      errSpy.mockClear();

      pubsub.handleMessage({ channel: CHANNELS.BLOCKCHAIN, message: JSON.stringify(blockchain.chain)});

      expect(parseSpy).toHaveBeenCalledWith(JSON.stringify(blockchain.chain));
      expect(blockchainSpy).toHaveBeenCalledWith(blockchain.chain);
      expect(errSpy).toHaveBeenCalledWith('Incoming chain must be longer');
    });
  });

  describe('subscribeToChannels()', () => {
    const blockchain = new Blockchain();
    const pubsub = new PubSub({ blockchain });
    const subscriberSpy = jest.spyOn(pubsub.subscriber, 'subscribe');

    it('should subscribe to channels', () => {
      pubsub.subscribeToChannels();

      Object.values(CHANNELS).forEach(channel => {
        expect(subscriberSpy).toHaveBeenCalledWith(channel);
      });
    });
  });

  describe('Publishing to channels', () => {
    const blockchain = new Blockchain();
    const pubsub = new PubSub({ blockchain });
    const publisherSpy = jest.spyOn(pubsub.publisher, 'publish');

    beforeEach(() => {
      publisherSpy.mockImplementation(({ channel, message }) => { });
    });

    describe('publish()', () => {
      it('should publish messages to channels', () => {
        pubsub.publish({ channel: CHANNELS.TEST, message: 'blah blah' });

        expect(publisherSpy).toHaveBeenCalledWith(CHANNELS.TEST, 'blah blah');
      });
    });

    describe('broadcastChain()', () => {
      it('should broadcast the chain', () => {
        pubsub.broadcastChain();

        expect(publisherSpy).toHaveBeenCalledWith(CHANNELS.BLOCKCHAIN, JSON.stringify(pubsub.blockchain.chain));
      });
    });
  });
});