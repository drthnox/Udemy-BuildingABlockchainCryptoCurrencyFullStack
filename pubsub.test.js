const redis = require('redis');
const should = require('should');
const PubSub = require('./pubsub');
const CHANNELS = require('./pubsub');

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

    it('should subscribe to the TEST channel', () => {
      expect(subscriberSpy).toBeCalled(CHANNELS.TEST);
    });

    it('should define on message callback', () => {
      expect(onMessageSpy).toBeCalled();
    });
  });

});