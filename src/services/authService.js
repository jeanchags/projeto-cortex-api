/**
 * @fileoverview Serviço de autenticação para interagir com o provedor de identidade (simulado).
 * @version 1.1
 * @author Jean Chagas Fernandes - Studio Fix
 */

// Em um ambiente real, importaríamos o Firebase Admin SDK aqui.
// Ex: import admin from 'firebase-admin';
// admin.initializeApp({ credential: admin.credential.applicationDefault() });

/**
 * Valida as credenciais do usuário (email e senha) contra o provedor de identidade
 * e retorna um token JWT em caso de sucesso.
 *
 * @param {string} email O e-mail do usuário.
 * @param {string} password A senha do usuário.
 * @returns {Promise<{token: string}>} Uma promessa que resolve com o token JWT.
 * @throws {Error} Lança um erro se as credenciais forem inválidas (ex: 'auth/wrong-password').
 */
const validateCredentialsAndGetToken = async (email, password) => {
    // --- SIMULAÇÃO DA LÓGICA DO FIREBASE (LOGIN) ---
    // Esta função está mocada nos testes.

    if (password === 'umaSenhaMuitoForte123') {
        // Simula um token JWT retornado pelo Firebase
        return { token: `simulated.jwt.token.for.${email}` };
    } else if (email === 'notfound@email.com') {
        throw new Error('auth/user-not-found');
    } else {
        throw new Error('auth/wrong-password');
    }
};

/**
 * (SIMULAÇÃO) Cria um novo usuário no provedor de identidade (Firebase Admin SDK).
 * Em um cenário real: await admin.auth().createUser({ email, password });
 *
 * @param {string} email O e-mail do usuário.
 * @param {string} password A senha do usuário.
 * @returns {Promise<{uid: string, email: string}>} Uma promessa que resolve com o registro do usuário do provedor.
 * @throws {Error} Lança um erro se o provedor falhar (ex: 'auth/email-already-exists').
 */
const createUserInProvider = async (email, password) => {
    // --- SIMULAÇÃO DA CRIAÇÃO NO FIREBASE ---
    // O Firebase Admin SDK também validaria o formato do e-mail e a força da senha.
    if (!email || !password) {
        throw new Error('Email e senha são necessários para o provedor.');
    }

    // O Firebase lançaria este erro se o e-mail já existisse *lá*.
    // Nossa aplicação (controller) já deve ter verificado no *MongoDB* primeiro.
    if (email === 'firebase.duplicate@email.com') {
        throw new Error('auth/email-already-exists');
    }

    // Simula um registro de usuário bem-sucedido do Firebase
    return {
        uid: `firebase-uid-${Date.now()}`,
        email: email,
    };
};


export const authService = {
    validateCredentialsAndGetToken,
    createUserInProvider, // Exportando a nova função
};
