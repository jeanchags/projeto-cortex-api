/**
 * @fileoverview Testes de unidade para o modelo Report.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */
import mongoose from 'mongoose';
import Report from '../../src/models/Reports.js';

describe('Report Model Test', () => {
    it('should create a report successfully with all valid data', async () => {
        const reportData = {
            submissionId: new mongoose.Types.ObjectId(),
            generatedBy: new mongoose.Types.ObjectId(),
            result: { score: 95, summary: 'Excellent' },
        };
        const report = new Report(reportData);
        const savedReport = await report.save();

        expect(savedReport._id).toBeDefined();
        expect(savedReport.submissionId).toBe(reportData.submissionId);
        expect(savedReport.generatedBy).toBe(reportData.generatedBy);
        expect(savedReport.result).toEqual({ score: 95, summary: 'Excellent' });
        expect(savedReport.generatedAt).toBeInstanceOf(Date);
        expect(savedReport.createdAt).toBeInstanceOf(Date);
    });

    it('should fail to create a report without required field (submissionId)', async () => {
        const reportData = {
            generatedBy: new mongoose.Types.ObjectId(),
            result: { score: 95 },
        };
        const report = new Report(reportData);
        await expect(report.save()).rejects.toThrow('Report validation failed: submissionId: O ID da submissão (submissionId) é obrigatório.');
    });

    it('should fail to create a report without required field (generatedBy)', async () => {
        const reportData = {
            submissionId: new mongoose.Types.ObjectId(),
            result: { score: 95 },
        };
        const report = new Report(reportData);
        await expect(report.save()).rejects.toThrow('Report validation failed: generatedBy: O ID do usuário (generatedBy) é obrigatório.');
    });

    it('should fail to create a report without required field (result)', async () => {
        const reportData = {
            submissionId: new mongoose.Types.ObjectId(),
            generatedBy: new mongoose.Types.ObjectId(),
        };
        const report = new Report(reportData);
        await expect(report.save()).rejects.toThrow('Report validation failed: result: O objeto de resultado (result) é obrigatório.');
    });

    it('should assign a default value to generatedAt', async () => {
        const reportData = {
            submissionId: new mongoose.Types.ObjectId(),
            generatedBy: new mongoose.Types.ObjectId(),
            result: { score: 95 },
        };
        const report = new Report(reportData);
        const savedReport = await report.save();

        expect(savedReport.generatedAt).toBeDefined();
        // Verifica se a data é recente (menos de 5 segundos de diferença)
        expect(Date.now() - savedReport.generatedAt.getTime()).toBeLessThan(5000);
    });
});
