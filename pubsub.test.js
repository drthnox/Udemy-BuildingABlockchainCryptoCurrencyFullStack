const Blockchain = require('./blockchain');
const should = require('should');
const PubSub = require('./pubsub');
const { CHANNELS } = require('./config');
const redis = require('redis');

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

    it('should initialise by subscribing to the CHANNELS', () => {
      pubsub.init();

      expect(subscriberSpy).toHaveBeenCalledWith(CHANNELS.TEST);
      expect(subscriberSpy).toHaveBeenCalledWith(CHANNELS.BLOCKCHAIN);
      expect(onMessageSpy).toBeCalled();
    });
  });

  describe('handleMessage()', () => {

    const pubsub = new PubSub({ blockchain });
    const errSpy = jest.spyOn(console, 'error');

    beforeEach(() => {
      errSpy.mockClear();
    });

    it('should not attempt to replace the chain if a badly-formatted message is received on the BLOCKCHAIN channel', () => {
      pubsub.handleMessage({ channel: CHANNELS.BLOCKCHAIN, message: 'blah blah' });

      expect(errSpy).toHaveBeenCalledWith('Unexpected token b in JSON at position 0');
    });

    it('should attempt to replace the chain if a message is received on the BLOCKCHAIN channel', () => {
      const blockchainSpy = jest.spyOn(blockchain, 'replaceChain');
      const parseSpy = jest.spyOn(JSON, 'parse');

      pubsub.handleMessage({ channel: CHANNELS.BLOCKCHAIN, message: JSON.stringify(blockchain.chain)});

      expect(parseSpy).toHaveBeenCalledWith(JSON.stringify(blockchain.chain));
      expect(blockchainSpy).toHaveBeenCalledWith(blockchain.chain);
      expect(errSpy).toHaveBeenCalledWith('Incoming chain must be longer');
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
    const publisherSpy = jest.spyOn(pubsub.publisher, 'publish');

    beforeEach(() => {
      publisherSpy.mockImplementation(({ channel, message }) => { });
      publisherSpy.mockClear();
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