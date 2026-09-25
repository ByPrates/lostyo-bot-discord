// Despedida: guildMemberRemove -> mensagem de goodbye (goodbye-<guild> { channel, message }).
const Event = require('../../structure/Event');

module.exports = new Event({
    event: 'guildMemberRemove',
    once: false,
    run: async (__client__, member) => {
        try {
            const guildId = member.guild?.id;
            if (!guildId) return;
            const cfg = __client__.database.get('goodbye-' + guildId) || null;
            if (!cfg || !cfg.channel) return;
            const ch = await __client__.channels.fetch(cfg.channel).catch(() => null);
            if (!ch || !ch.isTextBased()) return;
            const text = String(cfg.message || '**{user}** left {server}.')
                .replace('{user}', '**' + (member.user?.tag || member.id) + '**')
                .replace('{server}', member.guild?.name || '')
                .replace('{count}', String(member.guild?.memberCount ?? ''));
            await ch.send(text).catch(() => null);
        } catch {}
    },
}).toJSON();
