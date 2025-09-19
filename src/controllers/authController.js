/**
 * @fileoverview Controller para lidar com autenticação de usuários.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */

import User from '@/src/models/User.js';
import { authService } from '@/src/services/authService.js';

/**
 * @controller login
 * @description Autentica um usuário (email/senha), valida com o Identity Platform,
 * busca dados no MongoDB e retorna um JWT + dados do usuário.
 * @route POST /api/v1/auth/login
 * @access Público
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
        // Conforme especificação
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
