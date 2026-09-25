// Boas-vindas: guildMemberAdd -> mensagem no canal + autorole + DM de entrada.
// Chaves (mesmo formato do /welcome): welcome-<guild> { channel, message },
// goodbye-<guild> { channel, message }, autoroles-<guild> [roleIds], joindm-<guild> texto.
// Placeholders: {user} {server} {count}.
const Event = require('../../structure/Event');

function fill(template, member) {
    return String(template || '')
        .replace('{user}', '<@' + member.id + '>')
        .replace('{server}', member.guild?.name || '')
        .replace('{count}', String(member.guild?.memberCount ?? ''));
}

module.exports = new Event({
    event: 'guildMemberAdd',
    once: false,
    run: async (__client__, member) => {
        try {
            const guildId = member.guild?.id;
            if (!guildId) return;
            // 1) mensagem de boas-vindas no canal
            try {
                const cfg = __client__.database.get('welcome-' + guildId) || null;
                if (cfg && cfg.channel) {
                    const ch = await __client__.channels.fetch(cfg.channel).catch(() => null);
                    if (ch && ch.isTextBased()) await ch.send(fill(cfg.message || 'Welcome {user} to {server}', member)).catch(() => null);
                }
            } catch {}
            // 2) autoroles
            try {
                const roles = __client__.database.get('autoroles-' + guildId) || [];
                for (const roleId of roles) {
                    const role = await member.guild.roles.fetch(roleId).catch(() => null);
                    if (role) await member.roles.add(role).catch(() => null);
                }
            } catch {}
            // 3) DM de entrada
            try {
                const dm = __client__.database.get('joindm-' + guildId) || null;
                if (dm) await member.send(fill(dm, member)).catch(() => null);
            } catch {}
        } catch {}
    },
}).toJSON();
