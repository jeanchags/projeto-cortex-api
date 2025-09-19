/**
 * @fileoverview Testes de integração para as rotas de autenticação (Auth).
 * @version 1.2
 * @author Jean Chagas Fernandes - Studio Fix
 */

import request from 'supertest';
import express from 'express';
// O Mongoose é importado apenas para o model, não para conectar/desconectar
import User from '@/src/models/User.js';
import authRoutes from '@/src/routes/auth.js';
import { authService } from '@/src/services/authService.js';

// Mockar o serviço de autenticação
jest.mock('@/src/services/authService.js', () => ({
    authService: {
        validateCredentialsAndGetToken: jest.fn(),
        createUserInProvider: jest.fn(),
    },
}));

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

describe('Auth Routes Integration Test (Login and Register)', () => {
    let mockUser;

    // Os blocos beforeAll e afterAll foram REMOVIDOS.
    // O jest.setup.js agora cuida da conexão e desconexão.

    beforeEach(async () => {
        // Limpar mocks
        jest.clearAllMocks();

        // O afterEach global limpa o banco.
        // Este beforeEach agora SÓ cria o usuário base para os testes.
        mockUser = await User.create({
            name: 'Joana Mendes',
            email: 'joana.mendes@email.com',
            authProviderUid: 'firebase-uid-123',
            role: 'COMMON',
            isActive: true,
        });
    });

    /*
     * ======================================
     * TESTES DE LOGIN (POST /login)
     * ======================================
     */
    describe('POST /api/v1/auth/login', () => {

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

            authService.validateCredentialsAndGetToken.mockResolvedValue({ token: mockToken });

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send(validCredentials);

            expect(res.status).toBe(200);
            expect(res.body.token).toBe(mockToken);
            expect(res.body.user).toBeDefined();
            expect(res.body.user.id).toBe(mockUser._id.toString());
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
            authService.validateCredentialsAndGetToken.mockRejectedValue(new Error('auth/wrong-password'));

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send(invalidCredentials);

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Credenciais inválidas.');
        });

        /**
         * @test {POST /login} - Falha (Usuário Inativo)
         * @description Verifica se o login é barrado para usuários inativos, mesmo com senha válida.
         */
        it('should return 401 Unauthorized if user is inactive in MongoDB', async () => {
            mockUser.isActive = false;
            await mockUser.save();

            const validCredentials = { email: mockUser.email, password: 'umaSenhaMuitoForte123' };
            authService.validateCredentialsAndGetToken.mockResolvedValue({ token: 'mock.jwt.token.123456' });

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send(validCredentials);

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Usuário não encontrado ou inativo.');
        });
    });

    /*
     * ======================================
     * TESTES DE REGISTRO (POST /register)
     * ======================================
     */
    describe('POST /api/v1/auth/register', () => {

        const newUserData = {
            name: 'Carlos Bastos',
            email: 'carlos.bastos@email.com',
            password: 'outraSenhaForte456',
            role: 'ADMIN'
        };

        /**
         * @test {POST /register} - Sucesso (US-01)
         * @description Deve registrar um novo usuário com sucesso (Status 201).
         */
        it('should register a new user successfully (201 Created)', async () => {

            const mockProviderResponse = {
                uid: 'firebase-uid-new-carlos',
                email: newUserData.email
            };
            authService.createUserInProvider.mockResolvedValue(mockProviderResponse);

            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(newUserData);

            expect(res.status).toBe(201);
            expect(res.body.id).toBeDefined();

            const dbUser = await User.findById(res.body.id);
            expect(dbUser).toBeDefined();
            expect(dbUser.email).toBe(newUserData.email);
            expect(dbUser.authProviderUid).toBe(mockProviderResponse.uid);
        });

        /**
         * @test {POST /register} - Falha (E-mail duplicado)
         * @description Deve retornar 400 se o e-mail já existir no MongoDB.
         */
        it('should return 400 Bad Request if email already exists in MongoDB', async () => {

            const duplicateUserData = {
                name: 'Outra Joana',
                email: mockUser.email, // E-mail da usuária criada no beforeEach
                password: 'anypassword123',
            };

            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(duplicateUserData);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('E-mail já cadastrado.');
            expect(authService.createUserInProvider).not.toHaveBeenCalled();
        });

        /**
         * @test {POST /register} - Falha (Campos Faltando)
         * @description Deve retornar 400 se um campo obrigatório (name) não for fornecido.
         */
        it('should return 400 Bad Request if a required field (name) is missing', async () => {
            const invalidData = {
                email: 'novo.email@teste.com',
                password: 'password123',
            };

            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(invalidData); // Faltando 'name'

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Nome, e-mail e senha são obrigatórios.');
            expect(authService.createUserInProvider).not.toHaveBeenCalled();
        });

        /**
         * @test {POST /register} - Falha (Validation Error do Mongoose)
         * @description Deve retornar 400 se a 'role' for inválida (conforme Schema).
         */
        it('should return 400 Bad Request for Mongoose validation error (invalid role)', async () => {

            authService.createUserInProvider.mockResolvedValue({ uid: 'firebase-temp-uid' });

            const invalidRoleData = {
                name: 'Test Role',
                email: 'test.role@email.com',
                password: 'password123',
                role: 'INVALID_ROLE' // Valor inválido segundo o Enum do Schema
            };

            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(invalidRoleData);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Erro de validação.');
        });
    });
});
