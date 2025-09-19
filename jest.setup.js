/**
 * @fileoverview Configuração global do Jest.
 * Inicia um servidor MongoDB in-memory e carrega variáveis de ambiente.
 * @version 2.1
 * @author Jean Chagas Fernandes - Studio Fix (Modificado por Desenvolvedor Full-Stack)
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv'; // 1. Importar o dotenv

// 2. Carregar variáveis de ambiente do arquivo .env
// Isso é crucial para que process.env.JWT_SECRET esteja disponível
dotenv.config({ path: '.env' });

// Instância do servidor in-memory
let mongoServer;

/**
 * Hook que é executado UMA VEZ antes de TODAS as suítes de teste.
 * Inicia um servidor MongoDB in-memory e estabelece a conexão do Mongoose.
 */
beforeAll(async () => {
    // Cria e inicia uma nova instância do MongoDB in-memory
    mongoServer = await MongoMemoryServer.create();

    // Obtém a URI de conexão do servidor in-memory
    const mongoUri = mongoServer.getUri();

    // Conecta o Mongoose a essa URI.
    await mongoose.connect(mongoUri);
});

/**
 * Hook que é executado UMA VEZ após TODAS as suítes de teste.
 * Encerra a conexão com o Mongoose e para o servidor in-memory.
 */
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop(); // Para o servidor in-memory
});
