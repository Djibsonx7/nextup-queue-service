const request = require('supertest');
const { app, server } = require('../src/app');
const redisClient = require('../config/redisConfig');

beforeEach(async () => {
    // Nettoyage de Redis avant chaque test
    await redisClient.del('queue1');
});

afterAll(async () => {
    await redisClient.quit();
    server.close();
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
            await request(app)
                .post('/api/queue/queue1')
                .send({ clientId: '12345' });

            const res = await request(app)
                .delete('/api/queue/queue1/12345');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Client removed from queue');
        });

        it('should return 404 if the client does not exist in the queue', async () => {
            const res = await request(app)
                .delete('/api/queue/queue1/nonexistentClient');
            
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Client not found in queue');
        });
    });

    describe('GET /queue/list', () => {
        it('should list all clients in the queue', async () => {
            await request(app).post('/api/queue/queue1').send({ clientId: 'client1' });
            await request(app).post('/api/queue/queue1').send({ clientId: 'client2' });

            const res = await request(app)
                .get('/api/queue/queue1');

            console.log(res.body);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.queue)).toBe(true);
            expect(res.body.queue).toEqual(['client1', 'client2']);
        });
    });

    describe('GET /queue/:queueName/:clientId/position', () => {
        beforeEach(async () => {
            await request(app).post('/api/queue/queue1').send({ clientId: 'client1' });
            await request(app).post('/api/queue/queue1').send({ clientId: 'client2' });
        });

        it('should return the correct position of the client in the queue', async () => {
            const res = await request(app)
                .get('/api/queue/queue1/client2/position');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.position).toBe(2); // client2 doit être en deuxième position
        });
    });

    describe('DELETE /queue/:queueName/:clientId', () => {
        beforeEach(async () => {
            await request(app).post('/api/queue/queue1').send({ clientId: 'client1' });
            await request(app).post('/api/queue/queue1').send({ clientId: 'client2' });
            await request(app).post('/api/queue/queue1').send({ clientId: 'client3' });
        });

        it('should remove the client from the queue and update the positions', async () => {
            const res = await request(app)
                .delete('/api/queue/queue1/client2');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Client removed from queue');

            const resPosition = await request(app)
                .get('/api/queue/queue1/client3/position');
            
            expect(resPosition.statusCode).toBe(200);
            expect(resPosition.body.position).toBe(2); // client3 doit maintenant être en deuxième position
        });
    });

    describe('Redis Integration', () => {
        it('should persist the queue data in Redis', async () => {
            await request(app).post('/api/queue/queue1').send({ clientId: 'client1' });
            
            const redisData = await redisClient.lRange('queue1', 0, -1);
            expect(redisData).toEqual(['client1']);
        });
    });

    describe('Queue Service Integration', () => {
        it('should handle a complete sequence of operations', async () => {
            await request(app).post('/api/queue/queue1').send({ clientId: 'client1' });
            await request(app).post('/api/queue/queue1').send({ clientId: 'client2' });

            const posRes = await request(app)
                .get('/api/queue/queue1/client2/position');
            expect(posRes.statusCode).toBe(200);
            expect(posRes.body.position).toBe(2);

            const delRes = await request(app)
                .delete('/api/queue/queue1/client1');
            expect(delRes.statusCode).toBe(200);

            const listRes = await request(app)
                .get('/api/queue/queue1');
            expect(listRes.statusCode).toBe(200);
            expect(listRes.body.queue).toEqual(['client2']);
        });
    });
});
