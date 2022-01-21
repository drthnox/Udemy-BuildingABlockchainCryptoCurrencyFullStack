var redis = require('redis');
var client = redis.createClient();

setTimeout(client.connect(), 5000);
client.disconnect();

client.on('connect', () => {
  console.log("You are now connected");
});

client.on('disconnect', () => {
  console.log("You are no longer connected");
});

client.on('error', err => {
  console.error(err);
});