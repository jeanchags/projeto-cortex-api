/**
 * @fileoverview Controller para gerenciar formulários.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */

import mongoose from 'mongoose';
import Form from '../models/Form.js';

/**
 * @function getFormById
 * @description Busca um formulário pelo ID.
 * @param {object} req - O objeto de requisição do Express.
 * @param {object} res - O objeto de resposta do Express.
 */
export const getFormById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Formulário não encontrado.' });
    }

    try {
        const form = await Form.findById(id);

        if (!form) {
            return res.status(404).json({ message: 'Formulário não encontrado.' });
        }

        res.status(200).json(form);
    } catch (error) {
        console.error('Erro ao buscar formulário:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
};
