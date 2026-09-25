// Log: guildMemberUpdate com timeout -> canal de logs.mod (logs-<guild>).
const Event = require('../../structure/Event');
const { resolveLocale, t } = require('../../utils/i18n');
const { sendLog } = require('../../utils/modlog');

module.exports = new Event({
    event: 'guildMemberUpdate',
    once: false,
    run: async (__client__, oldMember, newMember) => {
        try {
            const guildId = newMember.guild?.id;
            if (!guildId) return;
            const was = oldMember?.communicationDisabledUntilTimestamp || 0;
            const now = newMember.communicationDisabledUntilTimestamp || 0;
            if (now <= was) return; // só loga timeout novo
            const locale = resolveLocale({ guildId });
            await sendLog(__client__, guildId, 'mod', {
                title: 'Timeout',
                description: t('engine.log_timeout', { locale, vars: { user: newMember.user?.tag || newMember.id } }),
            });
        } catch {}
    },
}).toJSON();
