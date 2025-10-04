/**
 * @fileoverview Testes de integração para as rotas de autenticação.
 * @version 2.1
 * @author Jean Chagas Fernandes - Studio Fix
 */
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/app.js';
import User from '../../src/models/User.js';

describe('Auth Routes Integration Test', () => {

    describe('POST /api/v1/auth/register', () => {
        beforeEach(async () => {
            await User.deleteMany({});
        });

        it('should register a new user and return a verification message', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Carlos Silva',
                    email: 'carlos.silva@email.com',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).not.toHaveProperty('token');
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBe('Usuário registrado com sucesso. Por favor, verifique seu e-mail para ativar sua conta.');

            const userInDb = await User.findOne({ email: 'carlos.silva@email.com' });
            expect(userInDb).toBeDefined();
            expect(userInDb.isVerified).toBe(false);
        });

        it('should return 409 if email is already in use', async () => {
            const userData = {
                name: 'Usuario Existente',
                email: 'existente@email.com',
                password: 'password123',
            };
            await new User(userData).save();

            const res = await request(app).post('/api/v1/auth/register').send(userData);

            expect(res.statusCode).toEqual(409);
            expect(res.body.message).toBe('E-mail já cadastrado.');
        });

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Teste Email Invalido',
                    email: 'email-invalido',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.details[0].path).toBe('email');
        });

        it('should return 400 if password is too short', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Teste Senha Curta',
                    email: 'senha.curta@email.com',
                    password: '123',
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.details[0].path).toBe('password');
        });
    });


    describe('POST /api/v1/auth/login', () => {
        const testUserEmail = 'login.teste@email.com';
        const testUserPassword = 'password123';

        beforeEach(async () => {
            await User.deleteMany({});
            await new User({
                name: 'Usuario de Teste Login',
                email: testUserEmail,
                password: testUserPassword,
            }).save();
        });

        it('should login successfully and return 200 status with a token', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUserEmail,
                    password: testUserPassword,
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.email).toBe(testUserEmail);
        });

        it('should return 401 for incorrect password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUserEmail,
                    password: 'passwordErrada',
                });
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('E-mail ou senha inválidos.');
        });

        it('should return 401 for non-existent email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'naoexiste@email.com',
                    password: testUserPassword,
                });
            expect(res.statusCode).toEqual(401);
        });

        it('should return 400 if email is missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.details[0].path).toBe('email');
        });

        it('should return 400 if password is empty', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUserEmail,
                    password: '',
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.details[0].path).toBe('password');
        });

        it('should return 400 for invalid email format on login', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'email-invalido',
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.details[0].path).toBe('email');
        });
    });
});
