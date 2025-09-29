/**
 * @fileoverview Testes de unidade para o modelo Profile.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
     */
import mongoose from 'mongoose';
import Profile from '../../src/models/Profile.js';
import User from '../../src/models/User.js';

describe('Profile Model Test', () => {
    let testUser;

    // Hook para criar um usuário de teste antes de cada teste,
    // pois o Profile depende de um 'managedBy' válido.
    beforeEach(async () => {
        // Limpa as coleções para garantir um ambiente de teste limpo.
        await User.deleteMany({});
        await Profile.deleteMany({});

        // Cria e salva um usuário que atuará como o gerente do perfil.
        const user = new User({
            name: 'Usuário de Teste',
            email: 'user@teste.com',
            password: 'password123',
            role: 'ADMIN' // Role é irrelevante para este teste, mas é obrigatória
        });
        testUser = await user.save();
    });

    it('should create a profile successfully with valid minimum data', async () => {
        const profileData = {
            managedBy: testUser._id,
            personalData: {
                fullName: 'Cliente de Teste Válido',
            },
        };
        const profile = new Profile(profileData);
        const savedProfile = await profile.save();

        expect(savedProfile._id).toBeDefined();
        expect(savedProfile.managedBy).toEqual(testUser._id);
        expect(savedProfile.personalData.fullName).toBe('Cliente de Teste Válido');
        expect(savedProfile.createdAt).toBeDefined();
        expect(savedProfile.updatedAt).toBeDefined();
    });

    it('should fail to create a profile without the required "managedBy" field', async () => {
        const profileData = {
            personalData: {
                fullName: 'Cliente Sem Gerente',
            },
        };
        const profile = new Profile(profileData);
        let err;
        try {
            await profile.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.managedBy).toBeDefined();
        expect(err.errors.managedBy.message).toBe('O campo "managedBy" é obrigatório.');
    });

    it('should fail to create a profile without the required "personalData.fullName" field', async () => {
        const profileData = {
            managedBy: testUser._id,
            personalData: {
                // fullName está ausente
            },
        };
        const profile = new Profile(profileData);
        let err;
        try {
            await profile.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors['personalData.fullName']).toBeDefined();
        expect(err.errors['personalData.fullName'].message).toBe('O campo "fullName" é obrigatório.');
    });
});
