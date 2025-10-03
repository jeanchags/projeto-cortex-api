/**
 * @fileoverview Testes de integração para as rotas de Profile.
 * @version 1.2
 * @author Jean Chagas Fernandes - Studio Fix
 */
import request from 'supertest';
import { app } from '../../src/app.js';
import User from '../../src/models/User.js';
import Profile from '../../src/models/Profile.js';
import jwt from 'jsonwebtoken';

describe('Profile Routes Integration Test', () => {
    let userA, tokenA, userB, tokenB;

    // HOOK: Executa antes de CADA teste.
    // Garante um ambiente limpo e cria usuários e tokens novos para cada cenário,
    // assegurando total isolamento entre os testes.
    beforeEach(async () => {
        // A limpeza já é feita pelo jest.setup.js, mas para clareza,
        // poderíamos garantir que as coleções estejam limpas se necessário.
        await User.deleteMany({});
        await Profile.deleteMany({});

        // Cria usuários de teste
        userA = await new User({ name: 'Usuario A', email: 'usera@test.com', password: 'password123' }).save();
        userB = await new User({ name: 'Usuario B', email: 'userb@test.com', password: 'password123' }).save();

        // Gera tokens para os usuários
        tokenA = jwt.sign({ user: { id: userA.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
        tokenB = jwt.sign({ user: { id: userB.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    describe('POST /api/v1/profiles', () => {
        it('deve criar um novo perfil para um usuário autenticado e retornar 201', async () => {
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

        it('deve retornar 401 se nenhum token for fornecido', async () => {
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

        it('deve retornar 400 se personalData.fullName estiver faltando', async () => {
            const res = await request(app)
                .post('/api/v1/profiles')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    personalData: {} // fullName ausente
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.details[0].path).toBe('personalData.fullName');
        });

        it('deve retornar 401 para um token inválido', async () => {
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
        it('deve retornar 200 e a lista de perfis do usuário autenticado', async () => {
            await new Profile({ managedBy: userA._id, personalData: { fullName: 'Cliente 1 de A', email: 'cliente1@email.com' } }).save();
            await new Profile({ managedBy: userA._id, personalData: { fullName: 'Cliente 2 de A', email: 'cliente2@email.com' } }).save();

            const res = await request(app)
                .get('/api/v1/profiles')
                .set('Authorization', `Bearer ${tokenA}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.data.length).toBe(2);
            expect(res.body.data[0].fullName).toBe('Cliente 1 de A');
            expect(res.body.pagination.totalItems).toBe(2);
        });

        it('deve retornar 200 e uma lista vazia se o usuário não tiver perfis', async () => {
            const res = await request(app)
                .get('/api/v1/profiles')
                .set('Authorization', `Bearer ${tokenA}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toEqual([]);
            expect(res.body.pagination.totalItems).toBe(0);
        });

        it('deve retornar 401 se nenhum token for fornecido', async () => {
            const res = await request(app).get('/api/v1/profiles');
            expect(res.statusCode).toEqual(401);
        });

        it('deve garantir o isolamento de dados entre usuários', async () => {
            // Cria um perfil para o usuário B
            await new Profile({ managedBy: userB._id, personalData: { fullName: 'Cliente de B' } }).save();

            // Faz a requisição como usuário A
            const res = await request(app)
                .get('/api/v1/profiles')
                .set('Authorization', `Bearer ${tokenA}`);

            // Espera que a lista de perfis do usuário A esteja vazia
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toEqual([]);
            expect(res.body.pagination.totalItems).toBe(0);
        });

        it('deve lidar com a paginação corretamente', async () => {
            // Otimização: Cria os perfis em paralelo para acelerar o teste.
            const profilePromises = [];
            for (let i = 1; i <= 15; i++) {
                profilePromises.push(new Profile({ managedBy: userA._id, personalData: { fullName: `Cliente ${i}` } }).save());
            }
            await Promise.all(profilePromises);

            // Busca a segunda página com limite de 5
            const res = await request(app)
                .get('/api/v1/profiles?page=2&limit=5')
                .set('Authorization', `Bearer ${tokenA}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBe(5);
            expect(res.body.pagination.currentPage).toBe(2);
            expect(res.body.pagination.totalPages).toBe(3);
            expect(res.body.pagination.totalItems).toBe(15);
            // O primeiro item da segunda página deve ser o cliente 6 (assumindo ordenação padrão de inserção)
            expect(res.body.data[0].fullName).toContain('Cliente 6');
        });
    });
});
