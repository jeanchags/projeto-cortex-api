/**
 * @fileoverview Testes de integração para as rotas de Profile.
 * @version 1.1
 * @author Jean Chagas Fernandes - Studio Fix
 */
import request from 'supertest';
import { app } from '../../src/app.js';
import User from '../../src/models/User.js';
import Profile from '../../src/models/Profile.js';
import jwt from 'jsonwebtoken';

describe('Profile Routes Integration Test', () => {
    let userA;
    let tokenA;
    let userB;
    let tokenB;

    beforeAll(async () => {
        await User.deleteMany({});
        userA = await new User({ name: 'Usuario A', email: 'usera@test.com', password: 'password123' }).save();
        userB = await new User({ name: 'Usuario B', email: 'userb@test.com', password: 'password123' }).save();

        tokenA = jwt.sign({ user: { id: userA.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
        tokenB = jwt.sign({ user: { id: userB.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    beforeEach(async () => {
        await Profile.deleteMany({});
    });

    describe('POST /api/v1/profiles', () => {
        it('should create a new profile for an authenticated user and return 201', async () => {
            const res = await request(app)
                .post('/api/v1/profiles')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    personalData: {
                        fullName: 'Cliente Válido'
                    }
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.personalData.fullName).toBe('Cliente Válido');
            expect(res.body.managedBy).toBe(userA.id);
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app)
                .post('/api/v1/profiles')
                .send({
                    personalData: {
                        fullName: 'Cliente Sem Token'
                    }
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Acesso negado. Nenhum token fornecido ou token mal formatado.');
        });

        it('should return 400 if personalData.fullName is missing', async () => {
            const res = await request(app)
                .post('/api/v1/profiles')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    personalData: {} // fullName ausente
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.details[0].path).toBe('personalData.fullName');
        });

        it('should return 401 for an invalid token', async () => {
            const res = await request(app)
                .post('/api/v1/profiles')
                .set('Authorization', 'Bearer tokeninvalido123')
                .send({
                    personalData: {
                        fullName: 'Cliente com Token Inválido'
                    }
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Token inválido.');
        });
    });

    describe('GET /api/v1/profiles', () => {
        it('should return 200 and a list of profiles for an authenticated user', async () => {
            await new Profile({ managedBy: userA._id, personalData: { fullName: 'Cliente 1 de A' } }).save();
            await new Profile({ managedBy: userA._id, personalData: { fullName: 'Cliente 2 de A' } }).save();

            const res = await request(app)
                .get('/api/v1/profiles')
                .set('Authorization', `Bearer ${tokenA}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('profiles');
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.profiles.length).toBe(2);
            expect(res.body.profiles[0].fullName).toBe('Cliente 1 de A');
            expect(res.body.pagination.totalItems).toBe(2);
        });

        it('should return 200 and an empty list if the user has no profiles', async () => {
            const res = await request(app)
                .get('/api/v1/profiles')
                .set('Authorization', `Bearer ${tokenA}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.profiles).toEqual([]);
            expect(res.body.pagination.totalItems).toBe(0);
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/v1/profiles');

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Acesso negado. Nenhum token fornecido ou token mal formatado.');
        });

        it('should ensure data isolation between users', async () => {
            // Cria um perfil para o usuário B
            await new Profile({ managedBy: userB._id, personalData: { fullName: 'Cliente de B' } }).save();

            // Faz a requisição como usuário A
            const res = await request(app)
                .get('/api/v1/profiles')
                .set('Authorization', `Bearer ${tokenA}`);

            // Espera que a lista de perfis do usuário A esteja vazia
            expect(res.statusCode).toEqual(200);
            expect(res.body.profiles).toEqual([]);
            expect(res.body.pagination.totalItems).toBe(0);
        });

        it('should handle pagination correctly', async () => {
            // Cria 15 perfis para o usuário A
            for (let i = 1; i <= 15; i++) {
                await new Profile({ managedBy: userA._id, personalData: { fullName: `Cliente ${i}` } }).save();
            }

            // Busca a segunda página com limite de 5
            const res = await request(app)
                .get('/api/v1/profiles?page=2&limit=5')
                .set('Authorization', `Bearer ${tokenA}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.profiles.length).toBe(5);
            expect(res.body.pagination.currentPage).toBe(2);
            expect(res.body.pagination.totalPages).toBe(3);
            expect(res.body.pagination.totalItems).toBe(15);
            // O primeiro item da segunda página deve ser o cliente 6 (assumindo ordenação padrão)
            expect(res.body.profiles[0].fullName).toContain('Cliente 6');
        });
    });
});
