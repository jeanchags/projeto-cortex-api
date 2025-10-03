/**
 * @fileoverview Testes de integração para as rotas de Form.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */
import request from 'supertest';
import { app } from '../../src/app.js';
import User from '../../src/models/User.js';
import Form from '../../src/models/Form.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('GET /api/v1/forms/:id', () => {
    let user, token, form;

    beforeEach(async () => {
        await User.deleteMany({});
        await Form.deleteMany({});

        user = await new User({ name: 'Test User', email: 'test@test.com', password: 'password123' }).save();
        token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });

        form = await new Form({
            name: 'Test Form',
            version: '1.0.0',
            questions: [
                { questionText: 'Question 1', questionType: 'text' }
            ]
        }).save();
    });

    it('should return 200 and the form structure for an authenticated user', async () => {
        const res = await request(app)
            .get(`/api/v1/forms/${form._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id', form._id.toString());
        expect(res.body).toHaveProperty('name', 'Test Form');
        expect(res.body).toHaveProperty('version', '1.0.0');
        expect(res.body.questions).toHaveLength(1);
    });

    it('should return 401 if no token is provided', async () => {
        const res = await request(app)
            .get(`/api/v1/forms/${form._id}`);

        expect(res.statusCode).toEqual(401);
    });

    it('should return 404 for a non-existent form ID', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/v1/forms/${nonExistentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('Formulário não encontrado.');
    });

    it('should return 404 for an invalid form ID', async () => {
        const res = await request(app)
            .get('/api/v1/forms/123')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('Formulário não encontrado.');
    });
});
