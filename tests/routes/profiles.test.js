/**
 * @fileoverview Testes de integração para as rotas de Profile.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */
import request from 'supertest';
import { app } from '../../src/app.js';
import User from '../../src/models/User.js';
import Profile from '../../src/models/Profile.js';
import jwt from 'jsonwebtoken';

describe('Profile Routes Integration Test', () => {
    let testUser;
    let token;

    beforeAll(async () => {
        await User.deleteMany({});
        testUser = await new User({
            name: 'Usuário de Teste para Perfil',
            email: 'profileuser@test.com',
            password: 'password123'
        }).save();

        token = jwt.sign({ user: { id: testUser.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    beforeEach(async () => {
        await Profile.deleteMany({});
    });

    describe('POST /api/v1/profiles', () => {
        it('should create a new profile for an authenticated user and return 201', async () => {
            const res = await request(app)
                .post('/api/v1/profiles')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    personalData: {
                        fullName: 'Cliente Válido'
                    }
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.personalData.fullName).toBe('Cliente Válido');
            expect(res.body.managedBy).toBe(testUser.id);
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
                .set('Authorization', `Bearer ${token}`)
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
});
