const express = require('express');
const router = express.Router();
const queueService = require('../services/queueService');

// Route pour ajouter un client à la file d'attente
router.post('/:queueName', async (req, res) => {
    const { queueName } = req.params;
    const { clientId } = req.body;

    const result = await queueService.addToQueue(queueName, clientId);
    if (result.added && req.io) {
        req.io.emit('queue-updated', { queueName, clientId, action: 'added' });
        console.log('Event emitted:', { queueName, clientId, action: 'added' });
    }
    res.status(result.added ? 201 : 400).send({ message: result.message });
});

// Route pour obtenir la position d'un client dans la file d'attente
router.get('/:queueName/:clientId/position', async (req, res) => {
    const { queueName, clientId } = req.params;
    const position = await queueService.getClientPosition(queueName, clientId);
    res.status(200).send({ position });
});

// Route pour supprimer un client de la file d'attente
router.delete('/:queueName/:clientId', async (req, res) => {
    const { queueName, clientId } = req.params;
    const result = await queueService.removeFromQueue(queueName, clientId);
    
    if (result.removed && req.io) {
        req.io.emit('queue-updated', { queueName, clientId, action: 'removed' });
        console.log('Event emitted:', { queueName, clientId, action: 'removed' });
    }

    res.status(result.removed ? 200 : 404).send({ message: result.message });
});

// Route pour obtenir toute la file d'attente
router.get('/:queueName', async (req, res) => {
    const { queueName } = req.params;
    const queue = await queueService.getQueue(queueName);
    res.status(200).send({ queue });
});

module.exports = router;
