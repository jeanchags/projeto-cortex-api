/**
 * @fileoverview Testes unitários para o modelo User do Mongoose.
 * @version 1.0
 * @author Desenvolvedor Full-Stack
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '@/src/models/User.js';

describe('User Model Test', () => {
    let mongoServer;

    // Antes de todos os testes, inicializa um servidor MongoDB em memória.
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    // Depois de todos os testes, desconecta e para o servidor MongoDB.
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    // Limpa os dados do usuário após cada teste para garantir isolamento.
    afterEach(async () => {
        await User.deleteMany({});
    });

    /**
     * @test {User.create} - Sucesso
     * @description Verifica se um usuário pode ser criado com sucesso quando todos os dados válidos são fornecidos.
     */
    it('should create a user successfully with all valid data', async () => {
        const userData = {
            name: 'João da Silva',
            email: 'joao.silva@example.com',
            authProviderUid: 'uid-12345',
            role: 'NUTRITIONIST',
            isActive: true,
        };

        const user = new User(userData);
        const savedUser = await user.save();

        // Asserts
        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe(userData.name);
        expect(savedUser.email).toBe(userData.email);
        expect(savedUser.authProviderUid).toBe(userData.authProviderUid);
        expect(savedUser.role).toBe('NUTRITIONIST');
        expect(savedUser.isActive).toBe(true);
        expect(savedUser.createdAt).toBeDefined();
        expect(savedUser.updatedAt).toBeDefined();
    });

    /**
     * @test {User.create} - Falha
     * @description Verifica se a criação de um usuário falha quando um campo obrigatório, como o email, não é fornecido.
     */
    it('should fail to create a user when a required field (email) is not provided', async () => {
        const userData = {
            name: 'Maria Oliveira',
            authProviderUid: 'uid-54321',
        };

        const user = new User(userData);

        // Espera que a operação de salvar lance um erro de validação.
        let err;
        try {
            await user.save();
        } catch (error) {
            err = error;
        }

        // Asserts
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.email).toBeDefined();
        expect(err.errors.email.message).toBe('O campo "email" é obrigatório.');
    });

    /**
     * @test {User.email} - Unicidade
     * @description Verifica a restrição de unicidade do campo de e-mail.
     */
    it('should fail to create a user with a duplicate email', async () => {
        const userData = {
            name: 'Carlos Pereira',
            email: 'carlos.pereira@example.com',
            authProviderUid: 'uid-67890',
        };

        // Cria o primeiro usuário
        const user1 = new User(userData);
        await user1.save();

        // Tenta criar o segundo usuário com o mesmo email, mas UID diferente
        const user2 = new User({ ...userData, name: 'Carlos Outro', authProviderUid: 'uid-09876' });

        // Espera que a operação de salvar lance um erro de chave duplicada.
        await expect(user2.save()).rejects.toThrow();
    });

    /**
     * @test {User.role} - Enum
     * @description Verifica se a criação falha com um valor de 'role' inválido.
     */
    it('should fail to create a user with an invalid role', async () => {
        const userData = {
            name: 'Ana Souza',
            email: 'ana.souza@example.com',
            authProviderUid: 'uid-11223',
            role: 'INVALID_ROLE', // Valor inválido
        };

        const user = new User(userData);
        await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
});
