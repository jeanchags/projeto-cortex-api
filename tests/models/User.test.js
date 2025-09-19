/**
 * @fileoverview Testes de unidade para o modelo User.
 * @version 1.6
 * @author Jean Chagas Fernandes - Studio Fix (Modificado por Desenvolvedor Full-Stack)
 */
import mongoose from 'mongoose';
import User from '../../src/models/User.js';

describe('User Model Test', () => {

    // A conexão com o banco de dados é gerenciada globalmente pelo jest.setup.js

    // Hook para limpar a coleção de usuários antes de cada teste.
    beforeEach(async () => {
        await User.deleteMany({});
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
        expect(savedUser.password).toBeDefined();
        expect(savedUser.role).toBe(userData.role);
        expect(savedUser.createdAt).toBeDefined();
    });

    it('should fail to create a user without a required field (email)', async () => {
        const userData = {
            name: 'Maria Sem Email',
            password: 'password123',
        };
        const user = new User(userData);
        let err;
        try {
            await user.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.email).toBeDefined();
    });

    it('should fail to create a user with a duplicate email', async () => {
        expect.assertions(1);

        // CORREÇÃO A: A senha '123' era inválida (menos de 6 caracteres).
        // Usar uma senha válida para o primeiro usuário.
        const userData = { name: 'Duplicado', email: 'duplicado@email.com', password: 'password123' };
        const user1 = new User(userData);
        await user1.save(); // Agora isso deve funcionar

        const user2 = new User(userData);
        try {
            await user2.save(); // Isso deve falhar com o erro de duplicidade
        } catch (error) {
            expect(error.code).toBe(11000); // A asserção de duplicidade
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

        // CORREÇÃO B: Remover as crases (`) da string esperada
        // para corresponder exatamente à mensagem de erro do Mongoose.
        await expect(user.save()).rejects.toThrow('User validation failed: role: PACIENTE não é uma função válida.');
    });


    it('should trim the email before saving', async () => {
        const emailWithSpaces = '  teste.trim@email.com  ';
        const user = new User({
            name: 'Teste Trim',
            email: emailWithSpaces,
            password: 'password123'
        });
        const savedUser = await user.save();
        expect(savedUser.email).toBe('teste.trim@email.com');
    });

    it('should convert the email to lowercase before saving', async () => {
        const emailWithUppercase = 'Teste.CASE@Email.com';
        const user = new User({
            name: 'Teste Case',
            email: emailWithUppercase,
            password: 'password123'
        });
        const savedUser = await user.save();
        expect(savedUser.email).toBe('teste.case@email.com');
    });

    it('should assign the default role "COMMON" if none is provided', async () => {
        const user = new User({
            name: 'Usuario Comum',
            email: 'comum@email.com',
            password: 'password123'
        });
        const savedUser = await user.save();
        expect(savedUser.role).toBe('COMMON');
    });

});
