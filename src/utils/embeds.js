// Padrão visual de respostas do bot — todo comando usa estes builders.
// Identidade: accent branco, zero emoji, markdown pesado.
const { EmbedBuilder } = require('discord.js');
const { t } = require('./i18n');

const WHITE = 0xffffff;

function base(type, locale, description, fields = []) {
    const embed = new EmbedBuilder()
        .setColor(WHITE)
        .setTitle(t(`embeds.${type}`, { locale }))
        .setDescription(description)
        .setTimestamp();

    if (fields.length) embed.addFields(fields);
    return embed;
}

const successEmbed = (locale, description, fields) => base('success', locale, description, fields);
const errorEmbed = (locale, description, fields) => base('error', locale, description, fields);
const infoEmbed = (locale, description, fields) => base('info', locale, description, fields);
const warningEmbed = (locale, description, fields) => base('warning', locale, description, fields);

module.exports = { WHITE, successEmbed, errorEmbed, infoEmbed, warningEmbed };
