/**
 * @fileoverview Testes de integração para as rotas de autenticação.
 * @version 1.6
 * @author Jean Chagas Fernandes - Studio Fix
 */

import request from 'supertest';
import { app } from '../../src/app.js';
import { server } from '../../src/index.js';
import User from '../../src/models/User.js';

describe('Auth Routes Integration Test', () => {

    // Hook para limpar o banco de dados antes de cada teste na suíte.
    // Isso garante a isolação dos testes.
    beforeEach(async () => {
        await User.deleteMany({});
    });

    // Garante que o servidor seja fechado após todos os testes.
    afterAll((done) => {
        server.close(done);
    });

    describe('POST /api/v1/auth/register', () => {

        /**
         * @test {POST /register} - Sucesso
         * @description Deve registrar um novo usuário com sucesso e retornar status 201.
         */
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
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user.name).toBe('Carlos Silva');
        });

        /**
         * @test {POST /register} - Falha (E-mail Duplicado)
         * @description Deve retornar erro 409 se o e-mail já estiver em uso.
         */
        it('should return 409 if email is already in use', async () => {
            // Correção: Cria um usuário inicial com senha para simular o fluxo real.
            const userData = {
                name: 'Usuario Existente',
                email: 'existente@email.com',
                password: 'passwordSegura',
            };
            const existingUser = new User(userData);
            await existingUser.save();

            // Tenta registrar com o mesmo e-mail
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Novo Usuario',
                    email: 'existente@email.com',
                    password: 'outraPassword',
                });

            expect(res.statusCode).toEqual(409);
            expect(res.body.message).toBe('E-mail já cadastrado.');
        });


        /**
         * @test {POST /register} - Falha (Nome Faltando)
         * @description Deve retornar erro 400 com detalhes se o nome estiver faltando.
         */
        it('should return 400 with details if name is missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'semnome@email.com',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('A validação dos dados falhou.');
            expect(res.body.details).toBeInstanceOf(Array);
            expect(res.body.details[0].path).toBe('name');
        });

        /**
         * @test {POST /register} - Falha (E-mail Inválido)
         * @description Deve retornar erro 400 com detalhes se o e-mail tiver formato inválido.
         */
        it('should return 400 with details if email is invalid', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Teste Email Invalido',
                    email: 'email-invalido',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.details[0].path).toBe('email');
            expect(res.body.details[0].msg).toBe('Por favor, inclua um e-mail válido.');
        });

        /**
         * @test {POST /register} - Falha (Senha Curta)
         * @description Deve retornar erro 400 com detalhes se a senha for menor que 6 caracteres.
         */
        it('should return 400 with details if password is too short', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Teste Senha Curta',
                    email: 'senha.curta@email.com',
                    password: '123',
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.details[0].path).toBe('password');
            expect(res.body.details[0].msg).toBe('A senha deve conter no mínimo 6 caracteres.');
        });
    });
});
