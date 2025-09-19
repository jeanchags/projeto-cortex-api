/**
 * @fileoverview Define as rotas para o módulo de Autenticação.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */

import { Router } from 'express';
import { login } from '@/src/controllers/authController.js';
// Importaremos o 'register' aqui quando a BE-01 for concluída.

const router = Router();

// @route   POST /api/v1/auth/login
// @desc    Autentica o usuário e retorna o token
// @access  Público
router.post('/login', login);

// @route   POST /api/v1/auth/register
// @desc    Registra um novo usuário (Tarefa BE-01)
// router.post('/register', register);

export default router;
