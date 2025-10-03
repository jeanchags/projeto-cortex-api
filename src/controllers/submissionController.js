/**
 * @fileoverview Controller para gerenciar submissões de formulários.
 * @version 1.1
 * @author Jean Chagas Fernandes - Studio Fix
 */
import { validationResult } from 'express-validator';
import Submission from '../models/Submission.js';
import Profile from '../models/Profile.js';
import Report from '../models/Report.js'; // Importação do modelo Report
import reportGenerationService from '../services/reportGenerationService.js'; // Importação do serviço

/**
 * @function createSubmission
 * @description Cria uma nova submissão de formulário e gera o relatório correspondente.
 * @param {object} req - O objeto de requisição do Express.
 * @param {object} res - O objeto de resposta do Express.
 */
export const createSubmission = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'A validação dos dados falhou.',
            details: errors.array(),
        });
    }

    try {
        const { profileId, formVersion, answers } = req.body;
        const userId = req.user.id;

        // Verificação de Propriedade: Garante que o perfil pertence ao usuário logado.
        const profile = await Profile.findOne({ _id: profileId, managedBy: userId });
        if (!profile) {
            return res.status(403).json({ message: 'Acesso negado. O perfil não pertence ao usuário ou não foi encontrado.' });
        }

        const newSubmission = new Submission({
            profileId,
            formVersion,
            answers,
            submittedBy: userId,
        });

        await newSubmission.save();

        // --- Início da Integração da Geração de Relatório (BE-13) ---

        // 1. Invoca o serviço para gerar o conteúdo do relatório
        const reportResult = reportGenerationService.generate(newSubmission);

        // 2. Cria a nova instância do modelo Report
        const newReport = new Report({
            submissionId: newSubmission._id,
            generatedBy: userId,
            result: reportResult, // O resultado do serviço (content, score, summary)
        });

        // 3. Salva o relatório no banco de dados
        await newReport.save();

        // --- Fim da Integração ---

        // A resposta para o cliente continua sendo a submissão criada.
        res.status(201).json(newSubmission);

    } catch (error) {
        console.error('Erro ao criar submissão:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
};
