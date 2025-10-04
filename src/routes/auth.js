/**
 * @fileoverview Rotas para o recurso de autenticação (auth).
 * @version 2.3
 * @author Jean Chagas Fernandes - Studio Fix
 */
import express from 'express';
import { check } from 'express-validator';
import { register, login, verifyEmail, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// Cadeia de validação para o endpoint de registro
const registerValidation = [
    check('name', 'O nome é obrigatório.').not().isEmpty(),
    check('email', 'Por favor, inclua um e-mail válido.').isEmail(),
    check('password', 'A senha deve conter no mínimo 6 caracteres.').isLength({ min: 6 }),
];

// Cadeia de validação para o endpoint de login
const loginValidation = [
    check('email', 'Por favor, inclua um e-mail válido.').isEmail(),
    check('password', 'A senha é obrigatória.').not().isEmpty(),
];

// Cadeia de validação para o endpoint de reset de senha
const resetPasswordValidation = [
    check('password', 'A nova senha é obrigatória e deve ter no mínimo 6 caracteres.').isLength({ min: 6 }),
];


/**
 * @route   POST /api/v1/auth/register
 * @desc    Registra um novo usuário
 * @access  Public
 */
router.post('/register', registerValidation, register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Autentica um usuário e obtém o token
 * @access  Public
 */
router.post('/login', loginValidation, login);

/**
 * @route   GET /api/v1/auth/verify-email/:token
 * @desc    Verifica o e-mail de um usuário
 * @access  Public
 */
router.get('/verify-email/:token', verifyEmail);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Inicia o fluxo de recuperação de senha
 * @access  Public
 */
router.post('/forgot-password', [check('email').isEmail()], forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password/:token
 * @desc    Reseta a senha do usuário
 * @access  Public
 */
router.post('/reset-password/:token', resetPasswordValidation, resetPassword);


export default router;
