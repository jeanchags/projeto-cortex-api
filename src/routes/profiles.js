/**
 * @fileoverview Rotas para o recurso de perfis (Profile).
 * @version 1.2
 * @author Jean Chagas Fernandes - Studio Fix
 */
import express from 'express';
import { check } from 'express-validator';
import { createProfile, getProfiles, getProfileHistory } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validação para a criação de perfil
const createProfileValidation = [
    check('personalData.fullName', 'O nome completo é obrigatório.').not().isEmpty().trim(),
];

/**
 * @route   POST /api/v1/profiles
 * @desc    Cria um novo perfil de cliente
 * @access  Private
 */
router.post('/', protect, createProfileValidation, createProfile);


/**
 * @route   GET /api/v1/profiles
 * @desc    Lista os perfis de clientes do usuário logado
 * @access  Private
 */
router.get('/', protect, getProfiles);

/**
 * @route   GET /api/v1/profiles/:id/history
 * @desc    Busca o histórico de atividades de um perfil de cliente
 * @access  Private
 */
router.get('/:id/history', protect, getProfileHistory);


export default router;
