/**
 * @fileoverview Schema e Modelo do Perfil de Cliente para o MongoDB usando Mongoose.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */

import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    /**
     * Referência ao usuário (COMMON) que gerencia este perfil.
     * @type {mongoose.Schema.Types.ObjectId}
     */
    managedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'O campo "managedBy" é obrigatório.'],
        index: true, // Adiciona um índice para otimizar consultas por este campo.
    },

    /**
     * Dados pessoais do cliente.
     * @type {object}
     */
    personalData: {
        fullName: {
            type: String,
            required: [true, 'O campo "fullName" é obrigatório.'],
            trim: true,
        },
        birthDate: {
            type: Date,
        },
        gender: {
            type: String,
        },
        phone: {
            type: String,
        },
    },

    /**
     * Informações de anamnese do cliente.
     * A estrutura interna será detalhada em sprints futuros.
     * @type {object}
     */
    anamnesis: {
        type: Object,
        default: {},
    },

    /**
     * Histórico de medições do cliente.
     * A estrutura interna será detalhada em sprints futuros.
     * @type {Array}
     */
    measurements: {
        type: Array,
        default: [],
    },
}, {
    /**
     * Opções do Schema:
     * - timestamps: Adiciona os campos createdAt e updatedAt automaticamente.
     */
    timestamps: true,
});

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
