/**
 @fileoverview Configuração do Jest para o ambiente de testes.
 @version 1.0
 @author Desenvolvedor Full-Stack
 */
export default {
    // Indica ao Jest para usar o JSDOM para simular um ambiente de navegador (não necessário para back-end, mas boa prática)
    testEnvironment: 'node',

    // Transforma arquivos usando o babel-jest
    transform: {
        '^.+\.js$': 'babel-jest',
    },

    // Ignora a pasta node_modules ao procurar por arquivos de teste
    testPathIgnorePatterns: ['/node_modules/'],

    // Habilita o suporte a módulos ES6
    moduleFileExtensions: ['js', 'json', 'node'],

    // Corrige um erro comum com o mongodb-memory-server no Jest
    // Aumenta o timeout padrão para testes assíncronos
    testTimeout: 60000,

    // Mapeia os apelidos de módulo para os caminhos reais
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
};
