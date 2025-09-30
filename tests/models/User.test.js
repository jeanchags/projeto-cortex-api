/**
 * @fileoverview Testes de unidade para o modelo User.
 * @version 2.0
 * @author Jean Chagas Fernandes - Studio Fix
 */
import mongoose from 'mongoose';
import User from '../../src/models/User.js';

describe('User Model Test', () => {

    /**
     * Garante que os índices únicos sejam construídos no banco de dados ANTES de qualquer teste.
     * Usar createIndexes() é mais explícito e confiável em ambientes de teste.
     */
    beforeAll(async () => {
        await User.createIndexes();
    });

    // O hook beforeEach foi removido, pois a limpeza já é feita globalmente
    // pelo arquivo jest.setup.js, garantindo um ambiente limpo para cada teste.

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

        // 2. Tenta criar o segundo usuário com o mesmo e-mail
        const user2 = new User(userData);

        try {
            await user2.save();
            // Se o save() for bem-sucedido, o teste deve falhar intencionalmente.
            fail('A criação do segundo usuário deveria ter falhado, mas foi bem-sucedida.');
        } catch (error) {
            // 3. Verifica se a mensagem de erro contém o padrão de chave duplicada do MongoDB.
            // Esta é a forma mais robusta de verificar o erro de unicidade.
            expect(error.message).toMatch(/E11000 duplicate key error/);
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
