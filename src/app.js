const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const queueRoutes = require('./routes/queueRoutes');

dotenv.config();  // Charger les variables d'environnement

const app = express();

// Middleware
app.use(bodyParser.json());  // Parser les requêtes en JSON

// Routes
app.use('/api/queue', queueRoutes);  // Utilisation des routes pour les files d'attente

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server };
