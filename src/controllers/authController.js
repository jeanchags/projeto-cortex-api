import { validationResult } from 'express-validator';
import * as authService from '../services/authService.js';
import User from '../models/User.js';

/**
 * @function register
 * @description Registra um novo usuário no sistema.
 * @param {object} req - O objeto de requisição do Express.
 * @param {object} res - O objeto de resposta do Express.
 */
export const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'A validação dos dados falhou.',
            details: errors.array(),
        });
    }

    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'E-mail já cadastrado.' });
        }

        const { newUser, token } = await authService.registerUser({ name, email, password });

        return res.status(201).json({
            message: 'Usuário registrado com sucesso!',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
            token,
        });

    } catch (error) {
        console.error('Erro no registro do usuário:', error);
        return res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
};


/**
 * @function login
 * @description Autentica um usuário e retorna um token JWT.
 * @param {object} req - O objeto de requisição do Express.
 * @param {object} res - O objeto de resposta do Express.
 */
export const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'A validação dos dados falhou.',
            details: errors.array(),
        });
    }

    try {
        const { email, password } = req.body;

        const { user, token } = await authService.loginUser({ email, password });

        return res.status(200).json({
            message: 'Login realizado com sucesso!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        });

    } catch (error) {
        if (error.message === 'Credenciais inválidas' || error.message === 'Usuário não encontrado') {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        console.error('Erro no login do usuário:', error);
        return res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
};
