/**
 * @fileoverview Testes de unidade para o modelo User.
 * @version 1.3
 * @author Jean Chagas Fernandes - Studio Fix
 */

import User from '@/src/models/User.js';

describe('User Model Test', () => {

    // A configuração e limpeza do banco de dados em memória são gerenciadas
    // globalmente pelo arquivo jest.setup.js.

    /**
     * @test {User Model} - Sucesso
     * @description Testa a criação bem-sucedida de um usuário com dados válidos.
     */
    it('should create a user successfully with all valid data', async () => {
        const userData = {
            name: 'Joana Mendes',
            email: 'joana.mendes@email.com',
            authProviderUid: 'firebase-uid-123',
            role: 'ADMIN',
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
        // Usamos rejects.toThrow() para validar que a promessa é rejeitada.
        await expect(user.save()).rejects.toThrow('User validation failed: email: O campo "email" é obrigatório.');
    });

    /**
     * @test {User Model} - Refatorado: Falha (E-mail duplicado)
     * @description Testa a falha ao criar um usuário com um e-mail que já existe,
     * verificando o código de erro específico do MongoDB (11000).
     */
    it('should fail to create a user with a duplicate email with error code 11000', async () => {
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

        // A asserção agora espera que a promessa seja rejeitada e que o erro
        // contenha um objeto com a propriedade 'code' igual a 11000.
        await expect(duplicateUser.save()).rejects.toMatchObject({ code: 11000 });
    });


    /**
     * @test {User Model} - Corrigido: Falha (Role inválida)
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
        // Correção: a mensagem de erro real do Mongoose não inclui as crases (` `)
        await expect(user.save()).rejects.toThrow('User validation failed: role: PACIENTE não é uma função válida.');
    });

    /**
     * @test {User Model} - Novo: Edge Case (trim no e-mail)
     * @description Deve salvar o e-mail sem espaços no início ou no fim.
     */
    it('should save the email without leading/trailing spaces', async () => {
        const emailWithSpaces = '  teste.trim@email.com  ';
        const user = new User({
            name: 'Teste Trim',
            email: emailWithSpaces,
            authProviderUid: 'firebase-uid-trim',
        });
        const savedUser = await user.save();
        expect(savedUser.email).toBe('teste.trim@email.com');
    });

    /**
     * @test {User Model} - Novo: Edge Case (lowercase no e-mail)
     * @description Deve salvar o e-mail completamente em minúsculas.
     */
    it('should save the email in all lowercase', async () => {
        const emailWithUppercase = 'Teste.CASE@Email.com';
        const user = new User({
            name: 'Teste Case',
            email: emailWithUppercase,
            authProviderUid: 'firebase-uid-case',
        });
        const savedUser = await user.save();
        expect(savedUser.email).toBe('teste.case@email.com');
    });

    /**
     * @test {User Model} - Novo: Edge Case (valor padrão da role)
     * @description Deve atribuir a role 'COMMON' por padrão se nenhuma for fornecida.
     */
    it('should default the role to "COMMON" if not provided', async () => {
        const userWithoutRole = new User({
            name: 'Usuário Comum',
            email: 'comum@email.com',
            authProviderUid: 'firebase-uid-default',
        });
        const savedUser = await userWithoutRole.save();
        expect(savedUser.role).toBe('COMMON');
    });

});

