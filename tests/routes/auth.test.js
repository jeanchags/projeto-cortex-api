/**
 * @fileoverview Testes de integração para as rotas de autenticação (Auth).
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */

import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '@/src/models/User.js';
import authRoutes from '@/src/routes/auth.js';
import { authService } from '@/src/services/authService.js';

// Mockar o serviço de autenticação
jest.mock('@/src/services/authService.js');

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

describe('Auth Routes Integration Test (POST /api/v1/auth/login)', () => {
    let mongoServer;
    let mockUser;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // Limpar mocks e banco de dados
        jest.clearAllMocks();
        await User.deleteMany({});

        // Criar usuário de teste no banco MongoDB
        mockUser = await User.create({
            name: 'Joana Mendes',
            email: 'joana.mendes@email.com',
            authProviderUid: 'firebase-uid-123',
            role: 'NUTRITIONIST',
            isActive: true,
        });
    });

    /**
     * @test {POST /login} - Sucesso
     * @description Verifica o login bem-sucedido com credenciais válidas.
     */
    it('should return 200 OK with token and user data on successful login', async () => {
        const mockToken = 'mock.jwt.token.123456';
        const validCredentials = {
            email: mockUser.email,
            password: 'umaSenhaMuitoForte123',
        };

        // Simula o Firebase validando as credenciais com sucesso
        authService.validateCredentialsAndGetToken.mockResolvedValue({ token: mockToken });

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send(validCredentials);

        // Asserts
        expect(res.status).toBe(200);
        expect(res.body.token).toBe(mockToken);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.id).toBe(mockUser._id.toString());
        expect(res.body.user.name).toBe(mockUser.name);
        expect(res.body.user.email).toBe(mockUser.email);
        expect(res.body.user.role).toBe(mockUser.role);
    });

    /**
     * @test {POST /login} - Falha (Senha Incorreta)
     * @description Verifica a falha de login com senha incorreta.
     */
    it('should return 401 Unauthorized for invalid password', async () => {
        const invalidCredentials = {
            email: mockUser.email,
            password: 'senhaErrada123',
        };

        // Simula o Firebase rejeitando a senha
        authService.validateCredentialsAndGetToken.mockRejectedValue(new Error('auth/wrong-password'));

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send(invalidCredentials);

        // Asserts
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Credenciais inválidas.');
    });

    /**
     * @test {POST /login} - Falha (E-mail não cadastrado)
     * @description Verifica a falha de login com e-mail não cadastrado no Firebase.
     */
    it('should return 401 Unauthorized for user not found in identity provider', async () => {
        const notFoundCredentials = {
            email: 'notfound@email.com',
            password: 'anypassword',
        };

        // Simula o Firebase não encontrando o usuário
        authService.validateCredentialsAndGetToken.mockRejectedValue(new Error('auth/user-not-found'));

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send(notFoundCredentials);

        // Asserts
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Credenciais inválidas.');
    });

    /**
     * @test {POST /login} - Falha (Campos Faltando)
     * @description Verifica a validação de entrada (Bad Request).
     */
    it('should return 400 Bad Request if email or password are not provided', async () => {
        const res1 = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'joana.mendes@email.com' }); // Faltando senha

        const res2 = await request(app)
            .post('/api/v1/auth/login')
            .send({ password: 'umaSenhaMuitoForte123' }); // Faltando email

        // Asserts
        expect(res1.status).toBe(400);
        expect(res1.body.message).toBe('E-mail e senha são obrigatórios.');
        expect(res2.status).toBe(400);
        expect(res2.body.message).toBe('E-mail e senha são obrigatórios.');
    });

    /**
     * @test {POST /login} - Falha (Usuário Inativo)
     * @description Verifica se o login é barrado para usuários inativos, mesmo com senha válida.
     */
    it('should return 401 Unauthorized if user is inactive in MongoDB', async () => {
        // Desativa o usuário no nosso banco
        mockUser.isActive = false;
        await mockUser.save();

        const validCredentials = {
            email: mockUser.email,
            password: 'umaSenhaMuitoForte123',
        };
        const mockToken = 'mock.jwt.token.123456';

        // Simula o Firebase validando as credenciais (ele não sabe do 'isActive')
        authService.validateCredentialsAndGetToken.mockResolvedValue({ token: mockToken });

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send(validCredentials);

        // Asserts
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Usuário não encontrado ou inativo.');
    });
});