require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const queueRoutes = require('./routes/queueRoutes'); // Importe les routes

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

// Middleware pour attacher io à chaque requête
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Servir le fichier HTML pour tester Socket.IO
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Utilisation des routes pour les files d'attente
app.use('/api/queue', queueRoutes);

// Connexion Socket.IO
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
