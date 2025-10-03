/**
 * @fileoverview Testes de unidade para o modelo Profile.
 * @version 2.0
 * @author Jean Chagas Fernandes - Studio Fix
 */
import mongoose from 'mongoose';
import Profile from '../../src/models/Profile.js';
import User from '../../src/models/User.js';

describe('Profile Model Unit Test', () => {
    let testUser;

    // Cria um usuário de teste antes de todos os testes deste bloco.
    // Este usuário será usado para associar aos perfis.
    beforeAll(async () => {
        testUser = await new User({
            name: 'Usuário de Teste',
            email: 'user.test@example.com',
            password: 'password123'
        }).save();
    });

    // Limpa a coleção de Perfis antes de cada teste para garantir o isolamento.
    beforeEach(async () => {
        await Profile.deleteMany({});
    });

    it('should create a profile successfully with all required valid data', async () => {
        const profileData = {
            managedBy: testUser._id,
            personalData: {
                fullName: 'Cliente Válido da Silva',
            },
        };
        const profile = new Profile(profileData);
        const savedProfile = await profile.save();

        expect(savedProfile._id).toBeDefined();
        expect(savedProfile.managedBy).toBe(profileData.managedBy);
        expect(savedProfile.personalData.fullName).toBe('Cliente Válido da Silva');
        expect(savedProfile.createdAt).toBeInstanceOf(Date);
        expect(savedProfile.updatedAt).toBeInstanceOf(Date);
    });

    it('should fail to create a profile without the required "managedBy" field', async () => {
        const profileData = {
            personalData: {
                fullName: 'Cliente Sem Gerente',
            },
        };
        const profile = new Profile(profileData);
        // A sintaxe rejects.toThrow espera que a promessa seja rejeitada com um erro.
        await expect(profile.save()).rejects.toThrow('Profile validation failed: managedBy: O campo "managedBy" é obrigatório.');
    });

    it('should fail to create a profile without the required "personalData.fullName" field', async () => {
        const profileData = {
            managedBy: testUser._id,
            personalData: {
                // fullName está ausente
            },
        };
        const profile = new Profile(profileData);
        await expect(profile.save()).rejects.toThrow('Profile validation failed: personalData.fullName: O campo "fullName" é obrigatório.');
    });

    it('should trim the fullName before saving', async () => {
        const profileData = {
            managedBy: testUser._id,
            personalData: {
                fullName: '   Cliente Com Espaços   ',
            },
        };
        const profile = new Profile(profileData);
        const savedProfile = await profile.save();

        expect(savedProfile.personalData.fullName).toBe('Cliente Com Espaços');
    });

    it('should create a profile with optional fields successfully', async () => {
        const profileData = {
            managedBy: testUser._id,
            personalData: {
                fullName: 'Cliente Completo',
                birthDate: new Date('1990-01-15'),
                gender: 'Masculino',
                phone: '11999998888',
            },
            anamnesis: {
                observations: 'Nenhuma observação inicial.',
            },
            measurements: [{
                weight: 80,
                height: 180
            }],
        };
        const profile = new Profile(profileData);
        const savedProfile = await profile.save();

        expect(savedProfile._id).toBeDefined();
        expect(savedProfile.personalData.gender).toBe('Masculino');
        expect(savedProfile.anamnesis.observations).toBe('Nenhuma observação inicial.');
        expect(savedProfile.measurements).toHaveLength(1);
        expect(savedProfile.measurements[0].weight).toBe(80);
    });
});