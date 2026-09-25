// Log: messageDelete -> canal de logs.message (logs-<guild>).
const Event = require('../../structure/Event');
const { resolveLocale, t } = require('../../utils/i18n');
const { sendLog } = require('../../utils/modlog');

module.exports = new Event({
    event: 'messageDelete',
    once: false,
    run: async (__client__, message) => {
        try {
            if (!message || !message.guildId) return;
            if (message.author?.bot) return;
            if (message.partial) { try { await message.fetch().catch(() => null); } catch {} }
            const locale = resolveLocale({ guildId: message.guildId });
            const body = message.content ? String(message.content).slice(0, 1500) : '(sem texto / embed)';
            await sendLog(__client__, message.guildId, 'message', {
                title: 'Message deleted',
                description: t('engine.log_msgdel', { locale, vars: { ch: message.channelId, user: message.author?.tag || message.author?.id } }) + '\n' + body,
                sourceChannelId: message.channelId,
            });
        } catch {}
    },
}).toJSON();
