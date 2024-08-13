const redis = require('redis');

const client = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`
});

client.on('error', (err) => {
    console.error('Error connecting to Redis', err);
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.connect().catch(console.error);

module.exports = client;
