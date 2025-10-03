/**
 * @fileoverview Testes de unidade para o modelo Submission.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */
import mongoose from 'mongoose';
import Submission from '../../src/models/Submission.js';

describe('Submission Model Test', () => {
    it('should create a submission successfully with all valid data', async () => {
        const submissionData = {
            profileId: new mongoose.Types.ObjectId(),
            submittedBy: new mongoose.Types.ObjectId(),
            formVersion: '1.0.0',
            answers: { question1: 'answer1' },
        };
        const submission = new Submission(submissionData);
        const savedSubmission = await submission.save();

        expect(savedSubmission._id).toBeDefined();
        expect(savedSubmission.profileId).toBe(submissionData.profileId);
        expect(savedSubmission.submittedBy).toBe(submissionData.submittedBy);
        expect(savedSubmission.formVersion).toBe('1.0.0');
        expect(savedSubmission.answers).toEqual({ question1: 'answer1' });
        expect(savedSubmission.submittedAt).toBeInstanceOf(Date);
        expect(savedSubmission.createdAt).toBeInstanceOf(Date);
    });

    it('should fail to create a submission without required field (profileId)', async () => {
        const submissionData = {
            submittedBy: new mongoose.Types.ObjectId(),
            formVersion: '1.0.0',
            answers: { question1: 'answer1' },
        };
        const submission = new Submission(submissionData);
        await expect(submission.save()).rejects.toThrow('Submission validation failed: profileId: O ID do perfil (profileId) é obrigatório.');
    });

    it('should fail to create a submission without required field (submittedBy)', async () => {
        const submissionData = {
            profileId: new mongoose.Types.ObjectId(),
            formVersion: '1.0.0',
            answers: { question1: 'answer1' },
        };
        const submission = new Submission(submissionData);
        await expect(submission.save()).rejects.toThrow('Submission validation failed: submittedBy: O ID do usuário (submittedBy) é obrigatório.');
    });

    it('should fail to create a submission without required field (formVersion)', async () => {
        const submissionData = {
            profileId: new mongoose.Types.ObjectId(),
            submittedBy: new mongoose.Types.ObjectId(),
            answers: { question1: 'answer1' },
        };
        const submission = new Submission(submissionData);
        await expect(submission.save()).rejects.toThrow('Submission validation failed: formVersion: A versão do formulário (formVersion) é obrigatória.');
    });

    it('should fail to create a submission without required field (answers)', async () => {
        const submissionData = {
            profileId: new mongoose.Types.ObjectId(),
            submittedBy: new mongoose.Types.ObjectId(),
            formVersion: '1.0.0',
        };
        const submission = new Submission(submissionData);
        await expect(submission.save()).rejects.toThrow('Submission validation failed: answers: O objeto de respostas (answers) é obrigatório.');
    });

    it('should assign a default value to submittedAt', async () => {
        const submissionData = {
            profileId: new mongoose.Types.ObjectId(),
            submittedBy: new mongoose.Types.ObjectId(),
            formVersion: '1.0.0',
            answers: { question1: 'answer1' },
        };
        const submission = new Submission(submissionData);
        const savedSubmission = await submission.save();

        expect(savedSubmission.submittedAt).toBeDefined();
        // Verifica se a data é recente (menos de 5 segundos de diferença)
        expect(Date.now() - savedSubmission.submittedAt.getTime()).toBeLessThan(5000);
    });
});
