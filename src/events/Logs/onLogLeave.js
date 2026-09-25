// Log: guildMemberRemove -> canal de logs.member (logs-<guild>).
const Event = require('../../structure/Event');
const { resolveLocale, t } = require('../../utils/i18n');
const { sendLog } = require('../../utils/modlog');

module.exports = new Event({
    event: 'guildMemberRemove',
    once: false,
    run: async (__client__, member) => {
        try {
            const guildId = member.guild?.id;
            if (!guildId) return;
            const locale = resolveLocale({ guildId });
            await sendLog(__client__, guildId, 'member', {
                title: 'Member left',
                description: t('engine.log_leave', { locale, vars: { user: member.user?.tag || member.id } }),
            });
        } catch {}
    },
}).toJSON();
