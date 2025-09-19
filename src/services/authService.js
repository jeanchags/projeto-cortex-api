/**
 * @fileoverview Serviço de autenticação para interagir com o provedor de identidade.
 * @version 1.0
 * @author Desenvolvedor Full-Stack
 */

// Em um ambiente real, importaríamos o SDK do Firebase/Identity Platform aqui.
// Ex: import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// const auth = getAuth(firebaseApp);

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
    // --- SIMULAÇÃO DA LÓGICA DO FIREBASE ---
    // Esta função está mocada nos testes. Em produção, conteria a chamada real:
    //
    // try {
    //   const userCredential = await signInWithEmailAndPassword(auth, email, password);
    //   const token = await userCredential.user.getIdToken();
    //   return { token };
    // } catch (error) {
    //   // error.code (ex: 'auth/wrong-password', 'auth/user-not-found')
    //   throw new Error('Credenciais inválidas.');
    // }
    //
    // Como não podemos executar o SDK aqui, lançamos um erro se a senha não for
    // "umaSenhaMuitoForte123" (para fins de simulação de falha).

    if (password === 'umaSenhaMuitoForte123') {
        // Simula um token JWT retornado pelo Firebase
        return { token: `simulated.jwt.token.for.${email}` };
    } else if (email === 'notfound@email.com') {
        throw new Error('auth/user-not-found');
    } else {
        throw new Error('auth/wrong-password');
    }
};

export const authService = {
    validateCredentialsAndGetToken,
};
