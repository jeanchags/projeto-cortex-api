/**
 * @fileoverview Configuração do Babel para transpilar o código JavaScript moderno (ESM)
 * para um formato que o Jest (nosso ambiente de teste) consiga entender.
 * @version 1.0
 * @author Jean Chagas Fernandes - Studio Fix
 */
export default {
    presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};
