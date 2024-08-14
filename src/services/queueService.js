const redisClient = require('../../config/redisConfig');

// Ajouter un client à la file d'attente
const addToQueue = async (queueName, clientId) => {
    console.log(`addToQueue called with queueName: ${queueName}, clientId: ${clientId}`);
    
    const position = await redisClient.lPos(queueName, clientId);
    console.log(`Client position in queue: ${position}`);
    
    if (position === null) {
        await redisClient.rPush(queueName, clientId);
        console.log(`Client ${clientId} added to queue ${queueName}`);
        return { added: true, message: 'Client added to queue' };
    } else {
        console.log(`Client ${clientId} already in queue ${queueName}`);
        return { added: false, message: 'Client already in queue' };
    }
};

// Récupérer la position d'un client dans la file d'attente
const getClientPosition = async (queueName, clientId) => {
    const position = await redisClient.lPos(queueName, clientId);
    return position !== null ? position + 1 : -1;
};

// Supprimer un client de la file d'attente
const removeFromQueue = async (queueName, clientId) => {
    const position = await redisClient.lPos(queueName, clientId);

    if (position !== null) {
        await redisClient.lRem(queueName, 0, clientId);

        // Après la suppression, met à jour les positions si nécessaire
        const queue = await redisClient.lRange(queueName, 0, -1);
        for (let i = 0; i < queue.length; i++) {
            await redisClient.lSet(queueName, i, queue[i]);
        }
        return { removed: true, message: 'Client removed from queue' };
    } else {
        return { removed: false, message: 'Client not found in queue' };
    }
};

// Récupérer toute la file d'attente
const getQueue = async (queueName) => {
    const queue = await redisClient.lRange(queueName, 0, -1);
    return queue;
};

module.exports = {
    addToQueue,
    getClientPosition,
    removeFromQueue,
    getQueue
};
