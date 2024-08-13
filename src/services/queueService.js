const redisClient = require('../../config/redisConfig');
const { io } = require('../index');  // Importer l'instance Socket.IO depuis index.js

// Ajouter un client à la file d'attente
const addToQueue = async (queueName, clientId) => {
    await redisClient.rpush(queueName, clientId);
    io.emit('queue-updated', { queueName, clientId, action: 'added' });  // Émettre un événement Socket.IO
};

// Récupérer la position d'un client dans la file d'attente
const getClientPosition = async (queueName, clientId) => {
    const position = await redisClient.lpos(queueName, clientId);
    return position !== null ? position + 1 : -1;
};

// Supprimer un client de la file d'attente
const removeFromQueue = async (queueName, clientId) => {
    await redisClient.lrem(queueName, 0, clientId);
    io.emit('queue-updated', { queueName, clientId, action: 'removed' });  // Émettre un événement Socket.IO
};

// Récupérer toute la file d'attente
const getQueue = async (queueName) => {
    const queue = await redisClient.lrange(queueName, 0, -1);
    return queue;
};

module.exports = {
    addToQueue,
    getClientPosition,
    removeFromQueue,
    getQueue
};
