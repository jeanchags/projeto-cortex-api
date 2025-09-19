/**
 * @fileoverview Configuração do Babel para transpilar o código JavaScript moderno (ESM)
 * para um formato que o Jest (nosso ambiente de teste) consiga entender.
 * @version 1.0
 * @author Desenvolvedor Full-Stack
 */
export default {
    presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};
