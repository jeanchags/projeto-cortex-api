/**
 * @fileoverview Lógica de negócio para autenticação de usuários.
 * @version 1.3
 * @author Jean Chagas Fernandes - Studio Fix
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Registra um novo usuário, faz o hash da senha e gera um token JWT.
 * @param {object} userData - Os dados do usuário (name, email, password).
 * @returns {Promise<{newUser: object, token: string}>} O novo usuário e o token.
 */
export const registerUser = async ({ name, email, password }) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
    });

    await newUser.save();

    const payload = {
        user: {
            id: newUser.id,
        },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return { newUser, token };
};


/**
 * Autentica um usuário, verifica as credenciais e gera um token JWT.
 * @param {object} credentials - As credenciais do usuário (email, password).
 * @returns {Promise<{user: object, token: string}>} O usuário autenticado e o token.
 * @throws {Error} Se as credenciais forem inválidas ou o usuário não for encontrado.
 */
export const loginUser = async ({ email, password }) => {
    // Procura o usuário pelo e-mail e seleciona explicitamente o campo de senha.
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        // Lança um erro específico se o usuário não for encontrado.
        throw new Error('Usuário não encontrado');
    }

    // Compara a senha fornecida com a senha armazenada (hashed)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        // Lança um erro específico se a senha estiver incorreta.
        throw new Error('Credenciais inválidas');
    }

    const payload = {
        user: {
            id: user.id,
        },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return { user, token };
};
