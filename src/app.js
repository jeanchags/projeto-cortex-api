/**
 * @fileoverview Arquivo principal de configuração do aplicativo Express.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */

import express from 'express';
import morgan from 'morgan';
import authRoutes from "./routes/auth.js";

const app = express();

// Middleware para parsear JSON
app.use(express.json());
app.use(morgan('dev')); // <-- 2. Use o morgan em modo 'dev' para logs coloridos
app.use(express.json());

// Rotas da API
app.use('/api/v1/auth', authRoutes);

// Exporta o app para ser usado nos testes e no index.js
export { app };
