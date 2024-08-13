require('dotenv').config();
const express = require('express');
const http = require('http');  // Importation du module HTTP
const socketIo = require('socket.io');  // Importation de Socket.IO
const queueRoutes = require('./routes/queueRoutes');

const app = express();
const server = http.createServer(app);  // Création du serveur HTTP
const io = socketIo(server);  // Attachement de Socket.IO au serveur HTTP

app.use(express.json());
app.use('/api/queue', queueRoutes);

// Connexion Socket.IO
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {  // On utilise server.listen au lieu de app.listen
    console.log(`Server is running on port ${PORT}`);
});

module.exports = { io };
