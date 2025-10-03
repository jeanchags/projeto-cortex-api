/**
 * @fileoverview Schema e Modelo do Relatório (Report) para o MongoDB usando Mongoose.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */

import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    /**
     * Referência à submissão que originou este relatório.
     * @type {mongoose.Schema.Types.ObjectId}
     */
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        required: [true, 'O ID da submissão (submissionId) é obrigatório.'],
        index: true,
    },

    /**
     * Referência ao usuário associado à geração deste relatório.
     * @type {mongoose.Schema.Types.ObjectId}
     */
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'O ID do usuário (generatedBy) é obrigatório.'],
    },

    /**
     * Objeto contendo os resultados processados do relatório.
     * @type {object}
     */
    result: {
        type: Object,
        required: [true, 'O objeto de resultado (result) é obrigatório.'],
    },

    /**
     * A data e hora em que o relatório foi gerado.
     * @type {Date}
     */
    generatedAt: {
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

const Report = mongoose.model('Report', reportSchema);

export default Report;
