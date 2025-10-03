/**
 * @fileoverview Rotas para o recurso de submissões (submissions).
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */
import express from 'express';
import { check } from 'express-validator';
import { createSubmission } from '../controllers/submissionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validação para a criação de submissão
const createSubmissionValidation = [
    check('profileId', 'O ID do perfil é obrigatório e deve ser um ID válido.').not().isEmpty().isMongoId(),
    check('formVersion', 'A versão do formulário é obrigatória.').not().isEmpty(),
    check('answers', 'O campo de respostas é obrigatório e deve ser um objeto.').isObject(),
];

/**
 * @route   POST /api/v1/submissions
 * @desc    Cria uma nova submissão de formulário
 * @access  Private
 */
router.post('/', protect, createSubmissionValidation, createSubmission);

export default router;
