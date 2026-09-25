// Log: guildBanAdd/guildBanRemove -> canal de logs.mod (logs-<guild>).
const Event = require('../../structure/Event');
const { resolveLocale, t } = require('../../utils/i18n');
const { sendLog } = require('../../utils/modlog');

module.exports = new Event({
    event: 'guildBanAdd',
    once: false,
    run: async (__client__, ban) => {
        try {
            const guildId = ban.guild?.id;
            if (!guildId) return;
            const locale = resolveLocale({ guildId });
            await sendLog(__client__, guildId, 'mod', {
                title: 'Ban',
                description: t('engine.log_ban', { locale, vars: { user: ban.user?.tag || ban.user?.id } }),
            });
        } catch {}
    },
}).toJSON();
