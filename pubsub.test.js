const redis = require('redis');
const should = require('should');
const PubSub = require('./pubsub');

describe('PubSub()', () => {

  const redisSpy = jest.spyOn(redis, 'createClient');
  const pubsub = new PubSub();

  describe('constructor()', () => {
    it('should create a new PubSub with default attributes', () => {
      should.notEqual(pubsub.publisher, undefined);
      should.notEqual(pubsub.subscriber, undefined);
    });

    it('should subscribe to the TEST channel', () => {
      expect(redisSpy).toBeCalled();
    });
  });

});