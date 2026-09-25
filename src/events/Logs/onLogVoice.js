// Log: voiceStateUpdate (entra/sai de call) -> canal de logs.voice (logs-<guild>).
const Event = require('../../structure/Event');
const { resolveLocale, t } = require('../../utils/i18n');
const { sendLog } = require('../../utils/modlog');

module.exports = new Event({
    event: 'voiceStateUpdate',
    once: false,
    run: async (__client__, oldState, newState) => {
        try {
            const guild = newState.guild || oldState.guild;
            if (!guild) return;
            const member = newState.member || oldState.member;
            if (!member || member.user?.bot) return;
            const locale = resolveLocale({ guildId: guild.id });
            if (!oldState.channelId && newState.channelId) {
                const ch = await guild.channels.fetch(newState.channelId).catch(() => null);
                await sendLog(__client__, guild.id, 'voice', {
                    title: 'Voice join',
                    description: t('engine.log_voice_join', { locale, vars: { user: member.user.tag, ch: ch?.name || newState.channelId } }),
                });
            } else if (oldState.channelId && !newState.channelId) {
                const ch = await guild.channels.fetch(oldState.channelId).catch(() => null);
                await sendLog(__client__, guild.id, 'voice', {
                    title: 'Voice leave',
                    description: t('engine.log_voice_leave', { locale, vars: { user: member.user.tag, ch: ch?.name || oldState.channelId } }),
                });
            }
        } catch {}
    },
}).toJSON();
