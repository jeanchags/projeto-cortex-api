/**
 * @fileoverview Testes de unidade para o modelo User.
 * @version 2.2
 * @author Jean Chagas Fernandes - Studio Fix
 */
import mongoose from 'mongoose';
import User from '../../src/models/User.js';

describe('User Model Test', () => {

    beforeAll(async () => {
        await User.createIndexes();
    });

    it('should create a user successfully with all valid data', async () => {
        const userData = {
            name: 'João da Silva',
            email: 'joao.silva@email.com',
            password: 'password123',
            role: 'ADMIN',
        };
        const user = new User(userData);
        const savedUser = await user.save();
        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe(userData.name);
        expect(savedUser.email).toBe(userData.email);
    });

    it('should fail to create a user without a required field (email)', async () => {
        const userData = { name: 'Maria Sem Email', password: 'password123' };
        const user = new User(userData);
        await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail to create a user with a duplicate email', async () => {
        const userData = { name: 'Duplicado', email: 'duplicado@email.com', password: 'password123' };
        
        // 1. Cria o primeiro usuário com sucesso
        await User.create(userData);

        const maxRetries = 10;
        const retryDelay = 50; // ms

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // 2. Tenta salvar o usuário duplicado
                const user2 = new User(userData);
                await user2.save();

                // Se chegou aqui, o índice ainda não está ativo.
                // Se for a última tentativa, força a falha do teste.
                if (attempt === maxRetries) {
                    fail('O índice unique de e-mail não foi aplicado a tempo.');
                }

                // Aguarda um pouco antes da próxima tentativa
                await new Promise(res => setTimeout(res, retryDelay));

            } catch (error) {
                // 3. Verifica se a falha ocorreu pelo motivo esperado
                if (error.code === 11000) {
                    // SUCESSO! O índice funcionou. Podemos confirmar e sair.
                    expect(error.code).toBe(11000);
                    return; // Encerra o teste com sucesso.
                }

                // Se o erro for outro, algo inesperado aconteceu. Falha imediatamente.
                throw error;
            }
        }
    });

    it('should fail to create a user with an invalid role', async () => {
        const userData = {
            name: 'Role Inválida',
            email: 'role.invalida@email.com',
            password: 'password123',
            role: 'PACIENTE'
        };
        const user = new User(userData);
        await expect(user.save()).rejects.toThrow('User validation failed: role: A função `PACIENTE` não é válida.');
    });

    it('should trim the email before saving', async () => {
        const emailWithSpaces = '  teste.trim@email.com  ';
        const user = new User({ name: 'Teste Trim', email: emailWithSpaces, password: 'password123' });
        const savedUser = await user.save();
        expect(savedUser.email).toBe('teste.trim@email.com');
    });

    it('should convert the email to lowercase before saving', async () => {
        const emailWithUppercase = 'Teste.CASE@Email.com';
        const user = new User({ name: 'Teste Case', email: emailWithUppercase, password: 'password123' });
        const savedUser = await user.save();
        expect(savedUser.email).toBe('teste.case@email.com');
    });

    it('should assign the default role "COMMON" if none is provided', async () => {
        const user = new User({ name: 'Usuario Comum', email: 'comum@email.com', password: 'password123' });
        const savedUser = await user.save();
        expect(savedUser.role).toBe('COMMON');
    });
});
