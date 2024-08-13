require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const redisClient = require('../config/redisConfig');
  // Importer le client Redis

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

// Servir le fichier HTML pour tester Socket.IO
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Connexion Socket.IO
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Ajouter un client à la file d'attente et émettre un événement
app.post('/api/queue/:queueName', async (req, res) => {
    console.log('POST /api/queue/:queueName hit');

    const { queueName } = req.params;
    const { clientId } = req.body;

    try {
        await redisClient.rPush(queueName, clientId);
        const eventData = { queueName, clientId, action: 'added' };

        console.log('About to emit event:', eventData);
        io.emit('queue-updated', eventData);
        console.log('Event emitted:', eventData);

        res.status(201).send({ message: 'Client added to queue' });
    } catch (err) {
        console.error('Error adding client to queue:', err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Supprimer un client de la file d'attente et émettre un événement
app.delete('/api/queue/:queueName/:clientId', async (req, res) => {
    console.log('DELETE /api/queue/:queueName/:clientId hit');

    const { queueName, clientId } = req.params;

    try {
        await redisClient.lRem(queueName, 0, clientId);
        const eventData = { queueName, clientId, action: 'removed' };

        io.emit('queue-updated', eventData);
        console.log('Event emitted:', eventData);

        res.status(200).send({ message: 'Client removed from queue' });
    } catch (err) {
        console.error('Error removing client from queue:', err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = { io };
