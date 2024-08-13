require('dotenv').config();
const express = require('express');
const http = require('http');  // Importation du module HTTP
const socketIo = require('socket.io');  // Importation de Socket.IO
const path = require('path');  // Importation du module path pour gérer les chemins de fichiers
const queueRoutes = require('./routes/queueRoutes');

const app = express();
const server = http.createServer(app);  // Création du serveur HTTP
const io = socketIo(server);  // Attachement de Socket.IO au serveur HTTP

app.use(express.json());
app.use('/api/queue', queueRoutes);

// Servir le fichier HTML pour tester Socket.IO
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));  // Utilisation de path.join pour s'assurer de la portabilité du chemin
});

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

module.exports = { io };
