/**
 * @fileoverview Testes de integração para a rota de histórico do Profile.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */
import request from 'supertest';
import { app } from '../../src/app.js';
import User from '../../src/models/User.js';
import Profile from '../../src/models/Profile.js';
import Submission from '../../src/models/Submission.js';
import Report from '../../src/models/Reports.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('GET /api/v1/profiles/:id/history', () => {
    let userA, tokenA, userB, tokenB, profileA, profileB;

    beforeEach(async () => {
        // Limpeza
        await User.deleteMany({});
        await Profile.deleteMany({});
        await Submission.deleteMany({});
        await Report.deleteMany({});

        // Criação de Usuários
        userA = await new User({ name: 'Usuario A', email: 'usera@history.test.com', password: 'password123' }).save();
        userB = await new User({ name: 'Usuario B', email: 'userb@history.test.com', password: 'password123' }).save();

        // Criação de Tokens
        tokenA = jwt.sign({ user: { id: userA.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
        tokenB = jwt.sign({ user: { id: userB.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Criação de Perfis
        profileA = await new Profile({ managedBy: userA._id, personalData: { fullName: 'Cliente de A' } }).save();
        profileB = await new Profile({ managedBy: userB._id, personalData: { fullName: 'Cliente de B' } }).save();

        // Criação de dados de histórico para o ProfileA
        const submission1 = await new Submission({
            profileId: profileA._id,
            submittedBy: userA._id,
            formVersion: '1.0.0',
            answers: {},
            submittedAt: new Date('2023-10-26T10:00:00.000Z')
        }).save();

        const submission2 = await new Submission({
            profileId: profileA._id,
            submittedBy: userA._id,
            formVersion: '1.1.0',
            answers: {},
            submittedAt: new Date('2023-10-27T11:00:00.000Z')
        }).save();

        await new Report({
            submissionId: submission1._id,
            generatedBy: userA._id,
            result: {},
            generatedAt: new Date('2023-10-26T12:00:00.000Z')
        }).save();
    });

    it('deve retornar 200 e o histórico ordenado para o dono do perfil', async () => {
        const res = await request(app)
            .get(`/api/v1/profiles/${profileA._id}/history`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(3);

        // Verifica a ordem (do mais recente para o mais antigo)
        expect(res.body[0].type).toBe('submission');
        expect(new Date(res.body[0].date)).toEqual(new Date('2023-10-27T11:00:00.000Z'));
        expect(res.body[1].type).toBe('report');
        expect(new Date(res.body[1].date)).toEqual(new Date('2023-10-26T12:00:00.000Z'));
        expect(res.body[2].type).toBe('submission');
        expect(new Date(res.body[2].date)).toEqual(new Date('2023-10-26T10:00:00.000Z'));
    });

    it('deve retornar 404 ao tentar acessar o histórico de um perfil de outro usuário', async () => {
        const res = await request(app)
            .get(`/api/v1/profiles/${profileB._id}/history`)
            .set('Authorization', `Bearer ${tokenA}`); // Usuário A tentando acessar perfil de B

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('Perfil não encontrado ou não pertence ao usuário.');
    });

    it('deve retornar 200 e um array vazio para um perfil sem histórico', async () => {
        const res = await request(app)
            .get(`/api/v1/profiles/${profileB._id}/history`)
            .set('Authorization', `Bearer ${tokenB}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([]);
    });

    it('deve retornar 401 se nenhum token for fornecido', async () => {
        const res = await request(app)
            .get(`/api/v1/profiles/${profileA._id}/history`);

        expect(res.statusCode).toEqual(401);
    });

    it('deve retornar 404 para um ID de perfil inválido', async () => {
        const invalidId = '12345';
        const res = await request(app)
            .get(`/api/v1/profiles/${invalidId}/history`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(res.statusCode).toEqual(404);
    });

    it('deve retornar 404 para um ID de perfil inexistente', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/v1/profiles/${nonExistentId}/history`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(res.statusCode).toEqual(404);
    });
});
