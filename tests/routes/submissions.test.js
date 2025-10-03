/**
 * @fileoverview Testes de integração para as rotas de Submission.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */
import request from 'supertest';
import { app } from '../../src/app.js';
import User from '../../src/models/User.js';
import Profile from '../../src/models/Profile.js';
import Form from '../../src/models/Form.js';
import Submission from '../../src/models/Submission.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('POST /api/v1/submissions', () => {
    let userA, tokenA, userB, tokenB, profileA, testForm;

    beforeEach(async () => {
        // Limpeza das coleções
        await User.deleteMany({});
        await Profile.deleteMany({});
        await Form.deleteMany({});
        await Submission.deleteMany({});

        // Criação de usuários e tokens
        userA = await new User({ name: 'Usuario A', email: 'usera@submission.test.com', password: 'password123' }).save();
        userB = await new User({ name: 'Usuario B', email: 'userb@submission.test.com', password: 'password123' }).save();
        tokenA = jwt.sign({ user: { id: userA.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
        tokenB = jwt.sign({ user: { id: userB.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Criação de perfil para o userA
        profileA = await new Profile({ managedBy: userA._id, personalData: { fullName: 'Cliente de A' } }).save();

        // Criação de um formulário de teste
        testForm = await new Form({ name: 'Form de Teste', version: '1.0.0', questions: [{ questionText: 'Q1', questionType: 'text' }] }).save();
    });

    it('should return 201 and create a submission for an authenticated user on their own profile', async () => {
        const submissionData = {
            profileId: profileA._id.toString(),
            formVersion: testForm.version,
            answers: { q1: 'Resposta para Q1' }
        };

        const res = await request(app)
            .post('/api/v1/submissions')
            .set('Authorization', `Bearer ${tokenA}`)
            .send(submissionData);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.profileId).toBe(submissionData.profileId);
        expect(res.body.submittedBy).toBe(userA.id);
        expect(res.body.answers.q1).toBe('Resposta para Q1');
    });

    it('should return 401 if no token is provided', async () => {
        const res = await request(app)
            .post('/api/v1/submissions')
            .send({
                profileId: profileA._id.toString(),
                formVersion: '1.0.0',
                answers: {}
            });
        expect(res.statusCode).toEqual(401);
    });

    it('should return 403 when userB tries to submit to a profile owned by userA', async () => {
        const submissionData = {
            profileId: profileA._id.toString(),
            formVersion: testForm.version,
            answers: { q1: 'Tentativa indevida' }
        };

        const res = await request(app)
            .post('/api/v1/submissions')
            .set('Authorization', `Bearer ${tokenB}`) // Token do userB
            .send(submissionData);

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toContain('Acesso negado');
    });

    it('should return 400 if profileId is missing', async () => {
        const res = await request(app)
            .post('/api/v1/submissions')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({
                formVersion: '1.0.0',
                answers: {}
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.details[0].path).toBe('profileId');
    });

    it('should return 400 for an invalid MongoDB profileId', async () => {
        const res = await request(app)
            .post('/api/v1/submissions')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({
                profileId: 'id-invalido',
                formVersion: '1.0.0',
                answers: {}
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.details[0].msg).toContain('deve ser um ID válido');
    });

    it('should return 400 if answers object is missing', async () => {
        const res = await request(app)
            .post('/api/v1/submissions')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({
                profileId: profileA._id.toString(),
                formVersion: '1.0.0'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.details[0].path).toBe('answers');
    });

    it('should return 401 for a malformed token', async () => {
        const res = await request(app)
            .post('/api/v1/submissions')
            .set('Authorization', 'Bearer token-quebrado')
            .send({
                profileId: profileA._id.toString(),
                formVersion: '1.0.0',
                answers: {}
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe('Token inválido.');
    });
});
