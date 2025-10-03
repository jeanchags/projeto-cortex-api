/**
 * @fileoverview Testes unitários para o ReportGenerationService.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */
import reportGenerationService from '../../src/services/reportGenerationService.js';
import mongoose from 'mongoose';

describe('ReportGenerationService Unit Test', () => {

    it('should generate a report from a valid submission object', () => {
        // 1. Setup: Cria um objeto de submissão mockado.
        const mockSubmission = {
            _id: new mongoose.Types.ObjectId(),
            answers: {
                question1: 'Resposta A',
                question2: 'Resposta B',
            },
        };

        // 2. Act: Executa o método a ser testado.
        const result = reportGenerationService.generate(mockSubmission);

        // 3. Assert: Valida se o resultado está correto.
        expect(result).toBeDefined();
        expect(result).toHaveProperty('content');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('summary');

        expect(result.content).toBe(`Relatório gerado para a submissão ${mockSubmission._id} com base nas respostas fornecidas.`);
        expect(result.score).toBe(20); // 2 respostas * 10 pontos
        expect(result.summary).toBe('Relatório com 2 resposta(s) processada(s).');
    });

    it('should generate a different report for a submission with different answers', () => {
        // 1. Setup
        const mockSubmission = {
            _id: new mongoose.Types.ObjectId(),
            answers: {
                q1: 'Sim',
                q2: 'Não',
                q3: 'Talvez',
                q4: 'Com certeza'
            },
        };

        // 2. Act
        const result = reportGenerationService.generate(mockSubmission);

        // 3. Assert
        expect(result.score).toBe(40); // 4 respostas * 10 pontos
        expect(result.summary).toBe('Relatório com 4 resposta(s) processada(s).');
        expect(result.content).toContain(mockSubmission._id.toString());
    });

    it('should throw an error if submission object is null or undefined', () => {
        // Tenta gerar um relatório passando null e undefined, esperando que um erro seja lançado.
        expect(() => {
            reportGenerationService.generate(null);
        }).toThrow('Objeto de submissão inválido ou incompleto.');

        expect(() => {
            reportGenerationService.generate(undefined);
        }).toThrow('Objeto de submissão inválido ou incompleto.');
    });

    it('should throw an error if submission is missing _id or answers', () => {
        // Testa com um objeto sem a propriedade 'answers'
        const submissionWithoutAnswers = {
            _id: new mongoose.Types.ObjectId()
        };
        expect(() => {
            reportGenerationService.generate(submissionWithoutAnswers);
        }).toThrow('Objeto de submissão inválido ou incompleto.');

        // Testa com um objeto sem a propriedade '_id'
        const submissionWithoutId = {
            answers: {
                q1: 'resposta'
            }
        };
        expect(() => {
            reportGenerationService.generate(submissionWithoutId);
        }).toThrow('Objeto de submissão inválido ou incompleto.');
    });

    it('should handle a submission with an empty answers object gracefully', () => {
        // 1. Setup
        const mockSubmission = {
            _id: new mongoose.Types.ObjectId(),
            answers: {}, // Objeto de respostas vazio
        };

        // 2. Act
        const result = reportGenerationService.generate(mockSubmission);

        // 3. Assert
        expect(result.score).toBe(0);
        expect(result.summary).toBe('Relatório com 0 resposta(s) processada(s).');
    });
});