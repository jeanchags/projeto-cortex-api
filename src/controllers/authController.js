/**
 * @fileoverview Controller para gerenciar autenticação de usuários.
 * @version 1.3
 * @author Jean Chagas Fernandes - Studio Fix
 */
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @function register
 * @description Registra um novo usuário e inicia o fluxo de verificação de e-mail.
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

        const newUser = await User.create({ name, email, password });

        // Gera o token de verificação (usando o _id do usuário para simplicidade)
        const verificationToken = newUser._id;

        // Monta a URL de verificação
        const verificationUrl = `http://localhost:3001/verify-email/${verificationToken}`;

        // Log da URL para fins de depuração
        console.log(`URL de Verificação Gerada: ${verificationUrl}`);

        // TODO: Implementar serviço de e-mail para enviar token de verificação
        // Exemplo: await emailService.sendVerificationEmail(newUser.email, verificationUrl);

        // Responde ao cliente sem o token de login
        return res.status(201).json({
            success: true,
            data: 'Usuário registrado com sucesso. Por favor, verifique seu e-mail para ativar sua conta.',
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

        // Procura o usuário pelo e-mail e seleciona explicitamente o campo de senha.
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        // --- INÍCIO DA IMPLEMENTAÇÃO: Verificação de status do e-mail ---
        // Verifica se o e-mail do usuário foi verificado.
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                error: "Por favor, verifique seu e-mail para ativar sua conta."
            });
        }
        // --- FIM DA IMPLEMENTAÇÃO ---

        // Compara a senha fornecida com a senha armazenada (hashed)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

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
        console.error('Erro no login do usuário:', error);
        return res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
};

/**
 * @function verifyEmail
 * @description Verifica o e-mail de um usuário a partir de um token.
 * @param {object} req - O objeto de requisição do Express.
 * @param {object} res - O objeto de resposta do Express.
 */
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findById(token);

        if (!user) {
            return res.status(400).json({ message: 'Token de verificação inválido.' });
        }

        user.isVerified = true;
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/login?verified=true`);

    } catch (error) {
        console.error('Erro na verificação de e-mail:', error);
        return res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
};
