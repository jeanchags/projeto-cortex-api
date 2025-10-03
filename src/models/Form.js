/**
 * @fileoverview Schema e Modelo do Formulário (Form) para o MongoDB usando Mongoose.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */

import mongoose from 'mongoose';

/**
 * Schema para uma Pergunta aninhada dentro de um Formulário.
 * Não é um modelo independente, mas a estrutura para cada pergunta.
 */
const questionSchema = new mongoose.Schema({
    /**
     * O texto da pergunta a ser exibido.
     * @type {string}
     */
    questionText: {
        type: String,
        required: [true, 'O texto da pergunta (questionText) é obrigatório.'],
    },

    /**
     * O tipo de pergunta, que determina como ela será renderizada e respondida.
     * @type {string}
     * @enum ['single-choice', 'multiple-choice', 'text']
     */
    questionType: {
        type: String,
        required: [true, 'O tipo da pergunta (questionType) é obrigatório.'],
        enum: {
            values: ['single-choice', 'multiple-choice', 'text'],
            message: 'O tipo de pergunta `{VALUE}` não é válido.',
        },
    },

    /**
     * Um array de strings contendo as opções de resposta.
     * Obrigatório se o questionType for 'single-choice' ou 'multiple-choice'.
     * @type {Array<string>}
     */
    options: {
        type: [String],
        required: function() {
            return ['single-choice', 'multiple-choice'].includes(this.questionType);
        },
        validate: [
            function(val) {
                // Garante que o array de opções não esteja vazio se o campo for obrigatório
                return !this.required || (Array.isArray(val) && val.length > 0);
            },
            'O campo "options" é obrigatório e não pode ser vazio para perguntas de múltipla escolha ou escolha única.'
        ]
    },

    /**
     * Indica se a resposta para esta pergunta é obrigatória.
     * @type {boolean}
     * @default true
     */
    isRequired: {
        type: Boolean,
        default: true,
    },
});

/**
 * Schema principal para o Formulário.
 */
const formSchema = new mongoose.Schema({
    /**
     * O nome do formulário.
     * @type {string}
     */
    name: {
        type: String,
        required: [true, 'O campo "name" é obrigatório.'],
    },

    /**
     * A versão semântica do formulário (ex: "1.0.0").
     * Deve ser única para evitar duplicatas.
     * @type {string}
     */
    version: {
        type: String,
        required: [true, 'O campo "version" é obrigatório.'],
        unique: true,
    },

    /**
     * Uma breve descrição sobre o propósito do formulário.
     * @type {string}
     */
    description: {
        type: String,
    },

    /**
     * Um array de perguntas que compõem o formulário.
     * Cada item do array segue o questionSchema.
     * @type {Array<object>}
     */
    questions: [questionSchema],

    /**
     * Controla se o formulário está ativo para novas submissões.
     * @type {boolean}
     * @default true
     */
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    /**
     * Opções do Schema:
     * - timestamps: Adiciona os campos createdAt e updatedAt automaticamente.
     */
    timestamps: true,
});

const Form = mongoose.model('Form', formSchema);

export default Form;
