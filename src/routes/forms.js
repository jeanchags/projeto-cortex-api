/**
 * @fileoverview Rotas para o recurso de formulários (form).
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */
import express from 'express';
import { getFormById } from '../controllers/formController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/v1/forms/:id
 * @desc    Busca um formulário pelo ID
 * @access  Private
 */
router.get('/:id', protect, getFormById);

export default router;