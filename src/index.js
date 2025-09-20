/**
 * @fileoverview Ponto de entrada da aplicação.
 * Responsável por iniciar o servidor.
 * @version 1.1
 * @author Jean Chagas Fernandes - Studio Fix
 */

import {app} from "./app.js";
import http from 'http';
import mongoose from 'mongoose';
import 'dotenv/config';

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const server = http.createServer(app);

console.log(`API: Tentando conectar ao MongoDB em ${MONGODB_URI}...`);

// Conexão com o MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('API: MongoDB Conectado com SUCESSO.');

        // *** SÓ INICIE O SERVIDOR DEPOIS QUE O BANCO CONECTAR ***
        server.listen(PORT, () => {
            console.log(`API: Servidor rodando na porta ${PORT}`);
        });

    })
    .catch(err => {
        // Se a conexão falhar, pare o container
        console.error('API: Falha ao conectar ao MongoDB. O servidor NÃO iniciou.', err);
        process.exit(1);
    });
