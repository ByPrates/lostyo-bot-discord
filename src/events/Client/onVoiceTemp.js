// Voz temporária: voiceStateUpdate cria/deleta calls.
// Chave (mesmo formato do /voice): tempvoice-<guild> { lobby }.
// Dono das calls: tempown-<guild> { channelId: ownerId }.
const { ChannelType } = require('discord.js');
const Event = require('../../structure/Event');

module.exports = new Event({
    event: 'voiceStateUpdate',
    once: false,
    run: async (__client__, oldState, newState) => {
        try {
            const guild = newState.guild || oldState.guild;
            if (!guild) return;
            const guildId = guild.id;
            const cfg = __client__.database.get('tempvoice-' + guildId) || null;

            // Entrou no lobby -> cria call própria e move o membro.
            if (cfg && cfg.lobby && newState.channelId === cfg.lobby) {
                try {
                    const lobby = await guild.channels.fetch(cfg.lobby).catch(() => null);
                    const member = newState.member;
                    if (!lobby || !member) return;
                    const ch = await guild.channels.create({
                        name: 'call-' + (member.displayName || member.user.username).slice(0, 20),
                        type: ChannelType.GuildVoice,
                        parent: lobby.parentId || undefined,
                        permissionOverwrites: [
                            { id: member.id, allow: ['ManageChannels', 'MoveMembers'] },
                        ],
                    }).catch(() => null);
                    if (!ch) return;
                    const own = __client__.database.get('tempown-' + guildId) || {};
                    own[ch.id] = member.id;
                    __client__.database.set('tempown-' + guildId, own);
                    await member.voice.setChannel(ch).catch(() => null);
                } catch {}
            }

            // Saiu de uma call temp vazia -> apaga.
            try {
                const leftId = oldState.channelId;
                if (!leftId || leftId === (cfg && cfg.lobby)) return;
                const own = __client__.database.get('tempown-' + guildId) || {};
                if (!own[leftId]) return;
                const ch = await guild.channels.fetch(leftId).catch(() => null);
                if (ch && ch.isVoiceBased() && ch.members.size === 0) {
                    await ch.delete().catch(() => null);
                    delete own[leftId];
                    __client__.database.set('tempown-' + guildId, own);
                }
            } catch {}
        } catch {}
    },
}).toJSON();
