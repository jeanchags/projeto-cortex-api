/**
 * @fileoverview Controller para lidar com autenticação e registro de usuários.
 * @version 1.1
 * @author Jean Chagas Fernandes - Studio Fix
 */

import User from '@/src/models/User.js';
import { authService } from '@/src/services/authService.js';

/**
 * @controller register
 * @description Registra um novo usuário (COMMON ou ADMIN).
 * Cria o usuário no Provedor de Identidade (Firebase) e depois no MongoDB.
 * @route POST /api/v1/auth/register
 * @access Público
 * @implements {US-01}
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Validação de Entrada (Campos básicos)
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
        }

        // 2. Verificação de Duplicidade (MongoDB)
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'E-mail já cadastrado.' });
        }

        // 3. Criação no Provedor de Identidade (Firebase)
        // O serviço simulado (ou real) lidará com falhas do lado do provedor (ex: e-mail mal formatado)
        const providerUser = await authService.createUserInProvider(email, password);

        // 4. Criação no Banco de Dados (MongoDB)
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            role: role || 'COMMON', // Role default conforme Schema
            authProviderUid: providerUser.uid, // UID do Firebase
        });

        const savedUser = await newUser.save();

        // 5. Resposta da API (Sucesso)
        // Conforme especificação
        return res.status(201).json({
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role,
            createdAt: savedUser.createdAt,
        });

    } catch (error) {
        // Captura erros de validação do Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Erro de validação.', details: error.message });
        }

        // Captura erros da simulação do Firebase
        if (error.message && error.message.startsWith('auth/')) {
            return res.status(400).json({ message: 'Erro no provedor de identidade.', code: error.message });
        }

        console.error('Erro no registro:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};


/**
 * @controller login
 * @description Autentica um usuário (email/senha), valida com o Identity Platform,
 * busca dados no MongoDB e retorna um JWT + dados do usuário.
 * @route POST /api/v1/auth/login
 * @access Público
 * @implements {US-02}
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validação de Entrada
        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        }

        let token;
        try {
            // 2. Validação de Credenciais no Identity Platform (Firebase)
            const authResult = await authService.validateCredentialsAndGetToken(email, password);
            token = authResult.token;
        } catch (error) {
            // 3. Falha na autenticação (senha errada, usuário não existe no Firebase)
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // 4. Busca de Dados Complementares no MongoDB
        // O usuário foi autenticado pelo Firebase, agora buscamos seus dados locais.
        const user = await User.findOne({ email: email.toLowerCase(), isActive: true });

        // Se o usuário foi autenticado no Firebase mas não existe (ou está inativo)
        // em nosso banco, não permitimos o login.
        if (!user) {
            return res.status(401).json({ message: 'Usuário não encontrado ou inativo.' });
        }

        // 5. Resposta da API (Sucesso)
        // Conforme especificação [cite: 147]
        return res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
