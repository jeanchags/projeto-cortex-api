/**
 * @fileoverview Ponto de entrada da aplicação.
 * Responsável por iniciar o servidor.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */

import http from 'http';
import { app } from './app.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Exporta o servidor para poder ser fechado nos testes
export { server };
