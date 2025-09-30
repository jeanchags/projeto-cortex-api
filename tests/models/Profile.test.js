/**
 * @fileoverview Testes de integração para as rotas de Profile.
 * @version 1.3
 * @author Jean Chagas Fernandes - Studio Fix
 */
import request from 'supertest';
import { app } from '../../src/app.js';
import User from '../../src/models/User.js';
import Profile from '../../src/models/Profile.js';
import jwt from 'jsonwebtoken';

describe('Profile Routes Integration Test', () => {
    let userA, tokenA, userB, tokenB;

    beforeEach(async () => {
        await User.deleteMany({});
        await Profile.deleteMany({});

        userA = await new User({ name: 'Usuario A', email: 'usera@test.com', password: 'password123' }).save();
        userB = await new User({ name: 'Usuario B', email: 'userb@test.com', password: 'password123' }).save();

        tokenA = jwt.sign({ user: { id: userA.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
        tokenB = jwt.sign({ user: { id: userB.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });


    describe('POST /api/v1/profiles', () => {
        it('should create a new profile for an authenticated user and return 201', async () => {
            const res = await request(app)
                .post('/api/v1/profiles')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    personalData: {
                        fullName: 'Cliente Válido',
                        email: 'cliente.valido@email.com'
                    }
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.personalData.fullName).toBe('Cliente Válido');
            expect(res.body.managedBy).toBe(userA.id);
        });

        // ... (outros testes de POST inalterados) ...
    });

    describe('GET /api/v1/profiles', () => {
        it('should return 200 and a list of profiles for an authenticated user', async () => {
            await new Profile({ managedBy: userA._id, personalData: { fullName: 'Cliente 1 de A', email: 'cliente1@email.com' } }).save();
            await new Profile({ managedBy: userA._id, personalData: { fullName: 'Cliente 2 de A', email: 'cliente2@email.com' } }).save();

            const res = await request(app)
                .get('/api/v1/profiles')
                .set('Authorization', `Bearer ${tokenA}`);

            expect(res.statusCode).toEqual(200);
            // CORREÇÃO: Verifica a chave 'data' conforme a especificação e o controller
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.data.length).toBe(2);
            expect(res.body.data[0].fullName).toBe('Cliente 1 de A');
            expect(res.body.data[0]).toHaveProperty('email');
            expect(res.body.pagination.totalItems).toBe(2);
        });

        it('should return 200 and an empty list if the user has no profiles', async () => {
            const res = await request(app)
                .get('/api/v1/profiles')
                .set('Authorization', `Bearer ${tokenA}`);

            expect(res.statusCode).toEqual(200);
            // CORREÇÃO: Verifica o array 'data'
            expect(res.body.data).toEqual([]);
            expect(res.body.pagination.totalItems).toBe(0);
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/v1/profiles');
            expect(res.statusCode).toEqual(401);
        });

        it('should ensure data isolation between users', async () => {
            await new Profile({ managedBy: userB._id, personalData: { fullName: 'Cliente de B' } }).save();

            const res = await request(app)
                .get('/api/v1/profiles')
                .set('Authorization', `Bearer ${tokenA}`);

            expect(res.statusCode).toEqual(200);
            // CORREÇÃO: Verifica o array 'data'
            expect(res.body.data).toEqual([]);
            expect(res.body.pagination.totalItems).toBe(0);
        });

        it('should handle pagination correctly', async () => {
            for (let i = 1; i <= 15; i++) {
                await new Profile({ managedBy: userA._id, personalData: { fullName: `Cliente ${i}` } }).save();
            }

            const res = await request(app)
                .get('/api/v1/profiles?page=2&limit=5')
                .set('Authorization', `Bearer ${tokenA}`);

            expect(res.statusCode).toEqual(200);
            // CORREÇÃO: Verifica o array 'data'
            expect(res.body.data.length).toBe(5);
            expect(res.body.pagination.currentPage).toBe(2);
            expect(res.body.pagination.totalPages).toBe(3);
            expect(res.body.pagination.totalItems).toBe(15);
            expect(res.body.data[0].fullName).toContain('Cliente 6');
        });
    });
});
