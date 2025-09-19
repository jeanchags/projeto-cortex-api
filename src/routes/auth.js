/**
 * @fileoverview Define as rotas para o módulo de Autenticação.
 * @version 1.1
 * @author Jean Chagas Fernandes - Studio Fix
 */

import { Router } from 'express';
import { login, register } from '@/src/controllers/authController.js'; // Importa o register

const router = Router();

// @route   POST /api/v1/auth/login
// @desc    Autentica o usuário e retorna o token
// @access  Público
router.post('/login', login);

// @route   POST /api/v1/auth/register
// @desc    Registra um novo usuário (Tarefa BE-02 / US-01)
// @access  Público
router.post('/register', register);

export default router;
