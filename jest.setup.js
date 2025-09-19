/**
 * @fileoverview Arquivo de setup global para o Jest.
 * Gerencia a inicialização e o encerramento do banco de dados em memória
 * e limpa o banco após cada teste.
 * @version 1.1
 * @author Jean Chagas Fernandes - Studio Fix
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

/**
 * Hook que roda UMA VEZ antes de TODA a suíte de testes.
 * Inicializa o MongoMemoryServer e conecta o Mongoose.
 */
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Opções para evitar warnings de depreciação (embora o Mongoose 6+ lide bem com isso)
    const mongooseOpts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    await mongoose.connect(uri, mongooseOpts);
});

/**
 * Hook que roda UMA VEZ depois de TODA a suíte de testes.
 * Desconecta o Mongoose e para o MongoMemoryServer.
 */
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

/**
 * Hook que roda DEPOIS DE CADA teste (bloco `it`).
 * Limpa todas as coleções do banco de dados para garantir isolamento.
 */
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});
