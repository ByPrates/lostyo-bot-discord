// Log: messageUpdate -> canal de logs.message (logs-<guild>).
const Event = require('../../structure/Event');
const { resolveLocale, t } = require('../../utils/i18n');
const { sendLog } = require('../../utils/modlog');

module.exports = new Event({
    event: 'messageUpdate',
    once: false,
    run: async (__client__, oldMsg, newMsg) => {
        try {
            const message = newMsg || oldMsg;
            if (!message || !message.guildId) return;
            if (message.author?.bot) return;
            if (message.partial) { try { await message.fetch().catch(() => null); } catch {} }
            const before = String(oldMsg?.content || '').slice(0, 700);
            const after = String(newMsg?.content || '').slice(0, 700);
            if (before === after) return;
            const locale = resolveLocale({ guildId: message.guildId });
            await sendLog(__client__, message.guildId, 'message', {
                title: 'Message edited',
                description: t('engine.log_msgedit', { locale, vars: { ch: message.channelId, user: message.author?.tag || message.author?.id } }) +
                    '\n[link](' + (message.url || '') + ')\n**Antes:**\n' + (before || '-') + '\n**Depois:**\n' + (after || '-'),
                sourceChannelId: message.channelId,
            });
        } catch {}
    },
}).toJSON();
