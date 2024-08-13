const express = require('express');
const router = express.Router();
const queueService = require('../services/queueService');

// Route pour ajouter un client à la file d'attente
router.post('/:queueName', async (req, res) => {
    const { queueName } = req.params;
    const { clientId } = req.body;
    await queueService.addToQueue(queueName, clientId);
    res.status(201).send({ message: 'Client added to queue' });
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
    await queueService.removeFromQueue(queueName, clientId);
    res.status(200).send({ message: 'Client removed from queue' });
});

// Route pour obtenir toute la file d'attente
router.get('/:queueName', async (req, res) => {
    const { queueName } = req.params;
    const queue = await queueService.getQueue(queueName);
    res.status(200).send({ queue });
});

module.exports = router;
