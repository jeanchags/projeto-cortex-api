/**
 * @fileoverview Define as rotas para o recurso de autenticação.
 * @version 1.1
 * @author Jean Chagas Fernandes - Studio Fix
 */

import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registra um novo usuário
 * @access  Public
 * @middlewares
 * - body('name'): Valida se o nome não está vazio.
 * - body('email'): Valida se o e-mail é válido.
 * - body('password'): Valida se a senha tem no mínimo 6 caracteres.
 */
router.post(
    '/register',
    [
        // Middleware de validação para o nome.
        body('name', 'O campo "name" é obrigatório e não pode estar vazio.')
            .notEmpty()
            .trim(),

        // Middleware de validação para o e-mail.
        body('email', 'Por favor, inclua um e-mail válido.')
            .isEmail()
            .normalizeEmail(),

        // Middleware de validação para a senha.
        body('password', 'A senha deve conter no mínimo 6 caracteres.')
            .isLength({ min: 6 }),
    ],
    authController.register
);


export default router;
