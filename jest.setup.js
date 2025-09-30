/**
 * @fileoverview Configuração global do Jest.
 * Inicia um servidor MongoDB in-docker e carrega variáveis de ambiente.
 * @version 3.1
 * @author Jean Chagas Fernandes - Studio Fix
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

/**
 * Hook que é executado UMA VEZ antes de TODAS as suítes de teste.
 * Conecta-se ao banco de dados MongoDB de teste que está rodando no Docker.
 */
beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI_TEST;

    if (!mongoUri || !mongoUri.includes('test')) {
        throw new Error('A variável de ambiente MONGODB_URI_TEST não foi definida ou não é de teste.');
    }

    await mongoose.connect(mongoUri);
});

/**
 * Hook que executa ANTES de CADA teste em todas as suítes.
 * Limpa todas as coleções para garantir que os testes sejam perfeitamente isolados.
 * Usar `beforeEach` para limpeza garante um estado limpo no início de cada teste.
 */
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
  }
});

/**
 * Hook que é executado UMA VEZ após TODAS as suítes de teste.
 * Garante que o banco de dados de teste seja completamente apagado
 * e que a conexão seja encerrada.
 */
afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});
