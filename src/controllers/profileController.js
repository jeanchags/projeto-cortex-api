/**
 * @fileoverview Controller para gerenciar perfis de clientes.
 * @version 1.3
 * @author Jean Chagas Fernandes - Studio Fix
 */

import { validationResult } from 'express-validator';
import Profile from '../models/Profile.js';
import Submission from '../models/Submission.js';
import Report from '../models/Report.js';
import mongoose from 'mongoose';


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

/**
 * @function getProfileHistory
 * @description Retorna o histórico de atividades (submissões e relatórios) de um perfil.
 * @param {object} req - O objeto de requisição do Express.
 * @param {object} res - O objeto de resposta do Express.
 */
export const getProfileHistory = async (req, res) => {
    try {
        const { id: profileId } = req.params;
        const userId = req.user.id;

        // 1. Validação de Propriedade
        const profile = await Profile.findOne({ _id: profileId, managedBy: userId });
        if (!profile) {
            return res.status(404).json({ message: 'Perfil não encontrado ou não pertence ao usuário.' });
        }

        // 2. Consulta de Submissões e Relatórios em paralelo
        const [submissions, reports] = await Promise.all([
            Submission.find({ profileId: profileId }).lean(),
            Report.find({ submissionId: { $in: await Submission.find({ profileId: profileId }).distinct('_id') } }).lean()
        ]);


        // 3. Unificação e Formatação
        const submissionEvents = submissions.map(sub => ({
            id: sub._id,
            type: 'submission',
            date: sub.submittedAt,
            details: {
                formVersion: sub.formVersion
            }
        }));

        const reportEvents = reports.map(rep => ({
            id: rep._id,
            type: 'report',
            date: rep.generatedAt,
            details: {
                submissionId: rep.submissionId
            }
        }));

        // 4. Ordenação
        const history = [...submissionEvents, ...reportEvents];
        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 5. Resposta
        res.status(200).json(history);

    } catch (error) {
        console.error('Erro ao buscar histórico do perfil:', error);
        if (error instanceof mongoose.Error.CastError) {
            return res.status(404).json({ message: 'Perfil não encontrado ou não pertence ao usuário.' });
        }
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
};
