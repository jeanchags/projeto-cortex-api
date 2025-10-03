/**
 * @fileoverview Controller para gerenciar perfis de clientes.
 * @version 1.2
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
    // ... (código existente inalterado)
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


/**
 * @function getProfiles
 * @description Retorna uma lista paginada de perfis gerenciados pelo usuário logado.
 * @param {object} req - O objeto de requisição do Express.
 * @param {object} res - O objeto de resposta do Express.
 */
export const getProfiles = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const [profiles, totalItems] = await Promise.all([
            Profile.find({ managedBy: userId })
                .select('personalData.fullName personalData.email updatedAt')
                .sort({ createdAt: 'asc' })
                .skip(skip)
                .limit(limit)
                .lean(),
            Profile.countDocuments({ managedBy: userId })
        ]);

        const formattedProfiles = profiles.map(p => ({
            id: p._id,
            fullName: p.personalData.fullName,
            email: p.personalData.email, // Adicionado email
            lastUpdate: p.updatedAt
        }));

        // ATUALIZAÇÃO: A chave principal foi alterada de 'profiles' para 'data' para seguir a especificação.
        res.status(200).json({
            data: formattedProfiles, // Alterado de 'profiles' para 'data'
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
            },
        });

    } catch (error) {
        console.error('Erro ao buscar perfis:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
};
