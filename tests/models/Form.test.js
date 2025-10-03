/**
 * @fileoverview Testes de unidade para o modelo Form.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */
import mongoose from 'mongoose';
import Form from '../../src/models/Form.js';

describe('Form Model Unit Test', () => {

    beforeAll(async () => {
        // Garante que o índice único de 'version' seja criado antes dos testes
        await Form.createIndexes();
    });

    // Limpa a coleção de Forms antes de cada teste
    beforeEach(async () => {
        await Form.deleteMany({});
    });

    it('should create a form successfully with valid questions of different types', async () => {
        const formData = {
            name: 'Diagnóstico Inicial',
            version: '1.0.0',
            description: 'Um formulário para entender o perfil do cliente.',
            questions: [{
                questionText: 'Qual sua idade?',
                questionType: 'text',
                isRequired: true,
            }, {
                questionText: 'Qual seu objetivo principal?',
                questionType: 'single-choice',
                options: ['Emagrecimento', 'Hipertrofia', 'Saúde'],
                isRequired: true,
            }, {
                questionText: 'Quais alimentos você não gosta?',
                questionType: 'multiple-choice',
                options: ['Brócolis', 'Peixe', 'Jiló', 'Abacate'],
                isRequired: false,
            }, ],
        };

        const form = new Form(formData);
        const savedForm = await form.save();

        expect(savedForm._id).toBeDefined();
        expect(savedForm.name).toBe('Diagnóstico Inicial');
        expect(savedForm.version).toBe('1.0.0');
        expect(savedForm.isActive).toBe(true);
        expect(savedForm.questions).toHaveLength(3);
        expect(savedForm.questions[0].questionType).toBe('text');
        expect(savedForm.questions[1].questionType).toBe('single-choice');
        expect(savedForm.questions[1].options).toEqual(['Emagrecimento', 'Hipertrofia', 'Saúde']);
        expect(savedForm.createdAt).toBeInstanceOf(Date);
    });

    it('should fail to create a form without the required "name" field', async () => {
        const formData = {
            version: '1.0.0',
            questions: [],
        };
        const form = new Form(formData);
        await expect(form.save()).rejects.toThrow('Form validation failed: name: O campo "name" é obrigatório.');
    });

    it('should fail to create a form without the required "version" field', async () => {
        const formData = {
            name: 'Formulário Sem Versão',
            questions: [],
        };
        const form = new Form(formData);
        await expect(form.save()).rejects.toThrow('Form validation failed: version: O campo "version" é obrigatório.');
    });

    it('should fail to create a form with a duplicate version', async () => {
        const formData1 = {
            name: 'Formulário Original',
            version: '2.0.0',
        };
        await new Form(formData1).save();

        const formData2 = {
            name: 'Formulário Duplicado',
            version: '2.0.0',
        };
        const form = new Form(formData2);

        // A mensagem de erro para violação de índice único pode variar, mas geralmente contém "E11000 duplicate key error".
        await expect(form.save()).rejects.toThrow(/E11000 duplicate key error/);
    });

    it('should fail if a question is missing "questionText"', async () => {
        const formData = {
            name: 'Formulário Inválido',
            version: '3.0.0',
            questions: [{
                questionType: 'text'
            }],
        };
        const form = new Form(formData);
        await expect(form.save()).rejects.toThrow('Form validation failed: questions.0.questionText: O texto da pergunta (questionText) é obrigatório.');
    });

    it('should fail if a question is missing "questionType"', async () => {
        const formData = {
            name: 'Formulário Inválido',
            version: '3.1.0',
            questions: [{
                questionText: 'Texto da pergunta'
            }],
        };
        const form = new Form(formData);
        await expect(form.save()).rejects.toThrow('Form validation failed: questions.0.questionType: O tipo da pergunta (questionType) é obrigatório.');
    });

    it('should fail if a single-choice question is missing "options"', async () => {
        const formData = {
            name: 'Formulário Inválido',
            version: '3.2.0',
            questions: [{
                questionText: 'Pergunta de escolha única',
                questionType: 'single-choice',
                // options está faltando
            }, ],
        };
        const form = new Form(formData);
        await expect(form.save()).rejects.toThrow('Form validation failed: questions.0.options: O campo "options" é obrigatório e não pode ser vazio para perguntas de múltipla escolha ou escolha única.');
    });

    it('should fail if a multiple-choice question has an empty "options" array', async () => {
        const formData = {
            name: 'Formulário Inválido',
            version: '3.3.0',
            questions: [{
                questionText: 'Pergunta de múltipla escolha',
                questionType: 'multiple-choice',
                options: [], // Array vazio
            }, ],
        };
        const form = new Form(formData);
        await expect(form.save()).rejects.toThrow('Form validation failed: questions.0.options: O campo "options" é obrigatório e não pode ser vazio para perguntas de múltipla escolha ou escolha única.');
    });

    it('should create a form with a text question without "options" field', async () => {
        const formData = {
            name: 'Formulário de Texto',
            version: '4.0.0',
            questions: [{
                questionText: 'Descreva sua rotina.',
                questionType: 'text',
            }, ],
        };
        const form = new Form(formData);
        const savedForm = await form.save();
        expect(savedForm._id).toBeDefined();
        expect(savedForm.questions[0].options).toBeUndefined();
    });
});
