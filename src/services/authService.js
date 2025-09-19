/**
 * @fileoverview Service para a lógica de negócio de autenticação.
 * @version 1.1
 * @author Jean Chagas Fernandes - Studio Fix
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Registra um novo usuário, faz o hash da senha e gera um token JWT.
 * @param {object} userData - Os dados do usuário (name, email, password).
 * @returns {Promise<{user: object, token: string}>} O usuário criado e o token.
 * @throws {Error} Se o e-mail já estiver cadastrado.
 */
// Correção: Adicionado 'export' para tornar a função acessível.
export const registerUser = async ({ name, email, password }) => {
    // 1. Verifica se o usuário já existe pelo e-mail
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('E-mail já cadastrado.');
    }

    // 2. Cria uma nova instância do usuário
    const user = new User({
        name,
        email,
        password, // A senha será hasheada pelo hook 'pre-save' no modelo
    });

    // 3. Salva o usuário no banco (o hook 'pre-save' será acionado aqui)
    await user.save();

    // 4. Gera o token JWT
    const payload = {
        user: {
            id: user.id,
        },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '5h',
    });

    // 5. Retorna o usuário e o token
    return { user, token };
};
