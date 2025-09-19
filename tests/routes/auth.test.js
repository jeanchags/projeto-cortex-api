/**
 * @fileoverview Testes de integração para as rotas de autenticação.
 * @version 2.0
 * @author Jean Chagas Fernandes - Studio Fix (Modificado por Desenvolvedor Full-Stack)
 */
import request from 'supertest';
import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs'; // Não é mais necessário aqui
import { app } from '../../src/app.js';
import User from '../../src/models/User.js';

describe('Auth Routes Integration Test', () => {
    // ... (O describe 'POST /api/v1/auth/register' está correto) ...

    describe('POST /api/v1/auth/register', () => {
        // Limpa a coleção antes de cada teste de registro
        beforeEach(async () => {
            await User.deleteMany({});
        });

        it('should register a new user successfully and return 201 status', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Carlos Silva',
                    email: 'carlos.silva@email.com',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.name).toBe('Carlos Silva');
        });

        it('should return 409 if email is already in use', async () => {
            const userData = {
                name: 'Usuario Existente',
                email: 'existente@email.com',
                password: 'password123', // Senha válida
            };
            await new User(userData).save(); // Salva diretamente no banco

            // Tenta registrar com o mesmo e-mail
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


    /**
     * Testes para o endpoint de Login de Usuário
     */
    describe('POST /api/v1/auth/login', () => {
        const testUserEmail = 'login.teste@email.com';
        const testUserPassword = 'password123';

        // Hook que roda ANTES de cada teste DESTE GRUPO ('login').
        // Garante que o usuário de teste exista.
        beforeEach(async () => {
            await User.deleteMany({});

            // CORREÇÃO: Não fazer o hash manualmente.
            // Salvar com a senha em texto plano e deixar o hook 'pre-save'
            // do modelo User fazer o hash.
            await new User({
                name: 'Usuario de Teste Login',
                email: testUserEmail,
                password: testUserPassword, // Salvar a senha em texto plano
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
