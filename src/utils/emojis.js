// Emojis personalizados do servidor (pretos, padrão Lostyo).
const { emojis } = require('../config');

function e(name) {
    const id = emojis?.[name];
    return id ? `<:${name}:${id}>` : '';
}

module.exports = { e, emojis };
