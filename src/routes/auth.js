/**
 * @fileoverview Rotas para o recurso de autenticação (auth).
 * @version 2.1
 * @author Jean Chagas Fernandes - Studio Fix
 */
import express from 'express';
import { check } from 'express-validator';
import { register, login, verifyEmail } from '../controllers/authController.js';

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


export default router;
