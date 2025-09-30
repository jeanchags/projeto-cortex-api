/**
 * @fileoverview Middleware para autenticação e autorização de rotas.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */

import jwt from 'jsonwebtoken';

/**
 * Middleware para verificar o token JWT.
 * @param {object} req - O objeto de requisição do Express.
 * @param {object} res - O objeto de resposta do Express.
 * @param {function} next - A próxima função de middleware.
 */
export const protect = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido ou token mal formatado.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido.' });
    }
};
