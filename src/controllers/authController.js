/**
 * @fileoverview Controller para lidar com a lógica de autenticação.
 * @version 1.1
 * @author Jean Chagas Fernandes - Studio Fix
 */

import { validationResult } from 'express-validator';
import * as authService from '../services/authService.js';

/**
 * Registra um novo usuário no sistema.
 * A validação do corpo da requisição é delegada para o middleware express-validator.
 * @param {import('express').Request} req - O objeto de requisição do Express.
 * @param {import('express').Response} res - O objeto de resposta do Express.
 */
export const register = async (req, res) => {
    // 1. Extrai os erros de validação da requisição.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Se houver erros, retorna uma resposta 400 com os detalhes.
        return res.status(400).json({
            message: 'A validação dos dados falhou.',
            details: errors.array(),
        });
    }

    // 2. Extrai os dados validados do corpo da requisição.
    const { name, email, password } = req.body;

    try {
        // 3. Chama o serviço de autenticação para criar o usuário.
        const { user, token } = await authService.registerUser({ name, email, password });

        // 4. Retorna uma resposta 201 (Created) com os dados do usuário e o token.
        return res.status(201).json({
            message: 'Usuário registrado com sucesso!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        // 5. Tratamento de erros de serviço (ex: e-mail duplicado).
        if (error.message.includes('E-mail já cadastrado')) {
            return res.status(409).json({ message: error.message });
        }

        // 6. Tratamento de outros erros inesperados.
        console.error('Erro no registro do usuário:', error);
        return res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
};
