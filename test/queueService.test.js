const request = require('supertest');
const { app, server } = require('../src/app');
const redisClient = require('../config/redisConfig'); // Importe le client Redis

afterAll(async () => {
    // Ferme la connexion Redis après tous les tests
    await redisClient.quit();
    // Ferme le serveur Express après tous les tests
    server.close();
    // Attends un petit moment pour assurer la fermeture complète
    await new Promise(resolve => setTimeout(() => resolve(), 500));
});

describe('Queue Service', () => {
    describe('POST /queue/add', () => {
        it('should add a client to the queue', async () => {
            const res = await request(app)
                .post('/api/queue/queue1')
                .send({ clientId: '12345' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message', 'Client added to queue');
        });
    });

    describe('DELETE /queue/remove', () => {
        it('should remove a client from the queue', async () => {
            const res = await request(app)
                .delete('/api/queue/queue1/12345');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Client removed from queue');
        });
    });

    describe('GET /queue/list', () => {
        it('should list all clients in the queue', async () => {
            const res = await request(app)
                .get('/api/queue/queue1');

            console.log(res.body); // Débogage de la réponse
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.queue)).toBe(true); // Vérifie que res.body.queue est un tableau
        });
    });
});
