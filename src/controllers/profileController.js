/**
 * @fileoverview Controller para gerenciar perfis de clientes.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */

import { validationResult } from 'express-validator';
import Profile from '../models/Profile.js';

/**
 * @function createProfile
 * @description Cria um novo perfil de cliente associado ao usuário logado.
 * @param {object} req - O objeto de requisição do Express.
 * @param {object} res - O objeto de resposta do Express.
 */
export const createProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'A validação dos dados falhou.',
            details: errors.array(),
        });
    }

    try {
        const { personalData } = req.body;
        const userId = req.user.id; // ID do usuário a partir do middleware de autenticação

        const newProfile = new Profile({
            managedBy: userId,
            personalData,
        });

        await newProfile.save();

        res.status(201).json(newProfile);

    } catch (error) {
        console.error('Erro ao criar perfil:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
};
