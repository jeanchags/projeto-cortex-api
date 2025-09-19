/**
 * @fileoverview Define o schema e o modelo Mongoose para a entidade User.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */

import mongoose from 'mongoose';

/**
 * @schema UserSchema
 * @description Schema do Mongoose para a coleção de usuários.
 *
 * @property {String} name - Nome do usuário. Campo obrigatório.
 * @property {String} email - Endereço de e-mail do usuário. Único, obrigatório e armazenado em minúsculas.
 * @property {String} authProviderUid - ID único do provedor de autenticação (ex: Firebase UID). Campo obrigatório e indexado.
 * @property {String} role - Função do usuário no sistema. Pode ser 'NUTRITIONIST' ou 'ADMIN'. O padrão é 'NUTRITIONIST'.
 * @property {Boolean} isActive - Status do usuário. Indica se o usuário está ativo ou não. O padrão é 'true'.
 * @property {Date} createdAt - Timestamp da criação do documento. Gerado automaticamente.
 * @property {Date} updatedAt - Timestamp da última atualização do documento. Gerado automaticamente.
 */
const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'O campo "name" é obrigatório.'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'O campo "email" é obrigatório.'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Por favor, forneça um endereço de e-mail válido.'],
        },
        authProviderUid: {
            type: String,
            required: [true, 'O campo "authProviderUid" é obrigatório.'],
            index: true,
        },
        role: {
            type: String,
            required: true,
            enum: {
                values: ['NUTRITIONIST', 'ADMIN'],
                message: '{VALUE} não é uma função válida.',
            },
            default: 'NUTRITIONIST',
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    {
        /**
         * @option timestamps
         * @description Adiciona os campos createdAt e updatedAt automaticamente.
         */
        timestamps: true,
    }
);

/**
 * @model User
 * @description Modelo Mongoose para a entidade 'User'.
 * Se o modelo já existir, ele é reutilizado; caso contrário, um novo modelo é criado.
 */
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
