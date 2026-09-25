// Helper de logs de servidor. Os comandos /logs setlog salvam
// `logs-<guildId>` = { mod, message, member, voice } -> channelId
// e `logignore-<guildId>` = [channelIds ignorados]. Este helper segue o mesmo formato.
const { EmbedBuilder } = require('discord.js');
const { WHITE } = require('./embeds');

async function sendLog(client, guildId, kind, { title, description, fields = [], sourceChannelId = null } = {}) {
    try {
        if (!guildId) return false;
        const map = client.database.get('logs-' + guildId) || {};
        const channelId = map[kind];
        if (!channelId) return false;
        const ignored = client.database.get('logignore-' + guildId) || [];
        if (sourceChannelId && ignored.includes(sourceChannelId)) return false;
        const ch = await client.channels.fetch(channelId).catch(() => null);
        if (!ch || !ch.isTextBased()) return false;
        const embed = new EmbedBuilder().setColor(WHITE).setTimestamp();
        if (title) embed.setTitle(String(title).slice(0, 256));
        if (description) embed.setDescription(String(description).slice(0, 4000));
        if (fields.length) embed.addFields(fields.slice(0, 25));
        await ch.send({ embeds: [embed] }).catch(() => null);
        return true;
    } catch {
        return false;
    }
}

module.exports = { sendLog };
