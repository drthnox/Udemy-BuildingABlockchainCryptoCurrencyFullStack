const redis = require('redis');
const should = require('should');
const PubSub = require('./pubsub');
const {CHANNELS} = require('./config');

describe('PubSub()', () => {

  const redisSpy = jest.spyOn(redis, 'createClient');
  const pubsub = new PubSub();

  describe('constructor()', () => {
    it('should create a new PubSub with default attributes', () => {
      should.notEqual(pubsub.publisher, undefined);
      should.notEqual(pubsub.subscriber, undefined);
      expect(redisSpy).toBeCalled();
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

});