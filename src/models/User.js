/**
 * @fileoverview Schema e Modelo do Usuário para o MongoDB usando Mongoose.
 * @version 1.3
 * @author Jean Chagas Fernandes - Studio Fix
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    /**
     * O nome completo do usuário.
     * @type {string}
     */
    name: {
        type: String,
        required: [true, 'O campo "name" é obrigatório.'],
    },

    /**
     * O endereço de e-mail do usuário.
     * É único, obrigatório e armazenado em minúsculas.
     * @type {string}
     */
    email: {
        type: String,
        required: [true, 'O campo "email" é obrigatório.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor, forneça um endereço de e-mail válido.',
        ],
    },

    /**
     * A senha do usuário.
     * Necessária apenas para autenticação via e-mail/senha.
     * @type {string}
     */
    password: {
        type: String,
        required: function() {
            // Torna a senha obrigatória apenas se não houver um provedor de autenticação externo.
            return !this.authProviderUid;
        },
        minlength: [6, 'A senha deve ter no mínimo 6 caracteres.'],
    },

    /**
     * O UID (User ID) do provedor de autenticação externo (ex: Google, Facebook).
     * @type {string}
     */
    authProviderUid: {
        type: String,
        // Correção: Torna o UID obrigatório apenas se a senha não for fornecida.
        required: function() {
            return !this.password;
        },
        unique: true,
        sparse: true, // Permite múltiplos documentos com valor nulo, mas garante unicidade para os que não são nulos.
    },


    /**
     * A função do usuário no sistema.
     * @type {string}
     * @enum ['ADMIN', 'COMMON']
     * @default 'COMMON'
     */
    role: {
        type: String,
        enum: {
            values: ['ADMIN', 'COMMON'], // Conforme arquitetura  (e spec [cite: 237] que usa 'NUTRITIONIST', mas o enum atual só tem ADMIN/COMMON)
            message: '{VALUE} não é uma função válida.',
        },
        default: 'COMMON',
    },

    /**
     * @correção (Adicionado v1.3)
     * Status do usuário. Conforme a arquitetura.
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


/**
 * Middleware (hook) do Mongoose que é executado antes de salvar o documento.
 * Se a senha foi modificada, faz o hash dela usando bcrypt.
 */
userSchema.pre('save', async function(next) {
    // Executa a função apenas se a senha foi modificada (ou é nova) e se a senha existe (não é login social)
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    // Gera o salt e faz o hash da senha
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


const User = mongoose.model('User', userSchema);

export default User;
