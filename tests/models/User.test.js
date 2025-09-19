/**
 * @fileoverview Testes de unidade para o modelo User.
 * @version 1.1
 * @author Jean Chagas Fernandes - Studio Fix
 */

import User from '@/src/models/User.js';

describe('User Model Test', () => {

    // Os blocos beforeAll, afterAll e afterEach foram REMOVIDOS.
    // O jest.setup.js agora cuida da conexão e limpeza.

    /**
     * @test {User Model} - Sucesso
     * @description Testa a criação bem-sucedida de um usuário com dados válidos.
     */
    it('should create a user successfully with all valid data', async () => {
        const userData = {
            name: 'Joana Mendes',
            email: 'joana.mendes@email.com',
            authProviderUid: 'firebase-uid-123',
            role: 'COMMON',
        };
        const user = new User(userData);
        const savedUser = await user.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe(userData.name);
        expect(savedUser.email).toBe(userData.email);
        expect(savedUser.role).toBe(userData.role);
        expect(savedUser.authProviderUid).toBe(userData.authProviderUid);
        expect(savedUser.isActive).toBe(true);
        expect(savedUser.createdAt).toBeDefined();
    });

    /**
     * @test {User Model} - Falha (Campo Obrigatório Faltando)
     * @description Testa a falha ao criar um usuário sem o campo 'email'.
     */
    it('should fail to create a user when a required field (email) is not provided', async () => {
        const userData = {
            name: 'Usuário Sem Email',
            authProviderUid: 'firebase-uid-456',
        };
        const user = new User(userData);

        let err;
        try {
            await user.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(Error);
        expect(err.errors.email).toBeDefined();
        expect(err.errors.email.kind).toBe('required');
    });

    /**
     * @test {User Model} - Falha (E-mail duplicado)
     * @description Testa a falha ao criar um usuário com um e-mail que já existe.
     */
    it('should fail to create a user with a duplicate email', async () => {
        // Cria o primeiro usuário
        await User.create({
            name: 'Usuário Original',
            email: 'duplicado@email.com',
            authProviderUid: 'firebase-uid-789',
        });

        // Tenta criar o segundo usuário com o mesmo e-mail
        const duplicateUser = new User({
            name: 'Usuário Duplicado',
            email: 'duplicado@email.com',
            authProviderUid: 'firebase-uid-101',
        });

        let err;
        try {
            await duplicateUser.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        // O Mongoose usa o código 11000 para erros de índice único (duplicidade)
        expect(err.code).toBe(11000);
    });

    /**
     * @test {User Model} - Falha (Role inválida)
     * @description Testa a falha ao criar um usuário com uma 'role' que não está no Enum.
     */
    it('should fail to create a user with an invalid role', async () => {
        const userData = {
            name: 'Usuário Role Inválida',
            email: 'role.invalida@email.com',
            authProviderUid: 'firebase-uid-112',
            role: 'PACIENTE', // Valor inválido
        };
        const user = new User(userData);

        let err;
        try {
            await user.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(Error);
        expect(err.errors.role).toBeDefined();
        expect(err.errors.role.kind).toBe('enum');
    });
});
