/**
 * @fileoverview Arquivo principal de configuração do aplicativo Express.
 * @version 1.2
 * @author Jean Chagas Fernandes - Studio Fix
 */

import express from 'express';
import morgan from 'morgan';
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profiles.js";
import formRoutes from "./routes/forms.js";

const app = express();

// Middleware para parsear JSON
app.use(express.json());
app.use(morgan('dev'));

// Rotas da API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/forms', formRoutes);

// Exporta o app para ser usado nos testes e no index.js
export { app };
