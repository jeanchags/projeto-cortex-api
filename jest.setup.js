/**
 * @fileoverview Configuração global do Jest.
 * Inicia um servidor MongoDB in-docker e carrega variáveis de ambiente.
 * @version 3.0
 * @author Jean Chagas Fernandes - Studio Fix (Modificado por Desenvolvedor Full-Stack)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente (essencial para JWT_SECRET nos testes)
dotenv.config({ path: '.env' });

/**
 * Hook que é executado UMA VEZ antes de TODAS as suítes de teste.
 * Conecta-se ao banco de dados MongoDB de teste que está rodando no Docker.
 */
beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI_TEST;

    if (!mongoUri) {
        throw new Error('A variável de ambiente MONGODB_URI_TEST não foi definida.');
    }

    await mongoose.connect(mongoUri);
});

/**
 * Hook que é executado DEPOIS de CADA teste em todas as suítes.
 * Limpa todas as coleções para garantir que os testes sejam perfeitamente isolados.
 * Mover a limpeza para afterEach é uma prática mais segura que beforeEach.
 */
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

/**
 * Hook que é executado UMA VEZ após TODAS as suítes de teste.
 * Garante que o banco de dados de teste seja completamente apagado
 * e que a conexão seja encerrada, deixando o ambiente limpo para a próxima execução.
 */
afterAll(async () => {
    // Apaga o banco de dados para garantir que os índices sejam recriados na próxima execução.
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});
