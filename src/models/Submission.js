/**
 * @fileoverview Schema e Modelo da Submissão de Formulário (Submission) para o MongoDB usando Mongoose.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */

import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    /**
     * Referência ao perfil de cliente ao qual esta submissão pertence.
     * @type {mongoose.Schema.Types.ObjectId}
     */
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: [true, 'O ID do perfil (profileId) é obrigatório.'],
        index: true,
    },

    /**
     * Referência ao usuário que realizou a submissão.
     * @type {mongoose.Schema.Types.ObjectId}
     */
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'O ID do usuário (submittedBy) é obrigatório.'],
    },

    /**
     * A versão do formulário que foi preenchido.
     * @type {string}
     */
    formVersion: {
        type: String,
        required: [true, 'A versão do formulário (formVersion) é obrigatória.'],
    },

    /**
     * Objeto contendo as respostas do formulário.
     * @type {object}
     */
    answers: {
        type: Object,
        required: [true, 'O objeto de respostas (answers) é obrigatório.'],
    },

    /**
     * A data e hora em que o formulário foi submetido.
     * @type {Date}
     */
    submittedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    /**
     * Opções do Schema:
     * - timestamps: Adiciona os campos createdAt e updatedAt automaticamente.
     */
    timestamps: true,
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
