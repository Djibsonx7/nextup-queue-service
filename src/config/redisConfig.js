const redis = require('redis');
const client = redis.createClient({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
});

client.on('error', (err) => {
    console.error('Error connecting to Redis', err);
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

module.exports = client;
