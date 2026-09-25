// Motor de mensagens: AFK + Automod + XP + Sticky (+ highlights).
// Listener único de messageCreate para manter a ordem: AFK -> Automod -> XP -> Sticky.
// Respeita `message_commands: off` (não executa comandos de prefixo; só engines).
// Chaves (mesmo formato dos comandos slash):
//   xp-<guild> { userId: { xp, level } }, levelmsg-<guild> { message, channel },
//   levelrewards-<guild> { level: roleId },
//   automod-<guild> { rule: { enabled } }, badwords-<guild> [], automod-action-<guild>,
//   automod-exempt-<guild> { roles: [], channels: [] },
//   afk-<guild> { userId: { reason, ts } }, highlights-<guild> { userId: [words] },
//   sticky-<guild> { channelId: { text, lastId } }.
const { ChannelType } = require('discord.js');
const Event = require('../../structure/Event');
const { resolveLocale, t } = require('../../utils/i18n');
const { infoEmbed } = require('../../utils/embeds');
const { sendLog } = require('../../utils/modlog');
const modstore = require('../../utils/modstore');

const xpCooldown = new Map(); // `${guild}:${user}` -> timestamp
const spamHits = new Map(); // `${guild}:${user}` -> [timestamps]

function levelFor(xp) {
    return Math.floor(Math.sqrt(Math.max(0, xp)) / 10);
}

function formatLevelMsg(template, member, level) {
    return String(template || '**{user}** reached level **{level}**.')
        .replace('{user}', '<@' + member.id + '>')
        .replace('{level}', String(level))
        .replace('{server}', member.guild?.name || '');
}

function isExempt(member, channelId, exempt) {
    if (!exempt) return false;
    if ((exempt.channels || []).includes(channelId)) return true;
    try {
        const roles = member?.roles?.cache;
        if (roles && (exempt.roles || []).some((r) => roles.has(r))) return true;
    } catch {}
    return false;
}

async function punish(client, message, locale, rule, action) {
    // Sempre apaga a mensagem ofensiva; warn/timeout somam punição + caso.
    try { await message.delete().catch(() => null); } catch {}
    const member = message.member;
    if (action === 'warn' && member) {
        try {
            modstore.push(client.database, 'warns', message.guildId, { userId: message.author.id, modId: client.user.id, reason: t('engine.automod_reason', { locale, vars: { rule } }) });
            modstore.push(client.database, 'cases', message.guildId, { action: 'automod-warn', userId: message.author.id, modId: client.user.id, reason: rule });
        } catch {}
    }
    if (action === 'timeout' && member && member.moderatable) {
        try { await member.timeout(10 * 60000, t('engine.automod_reason', { locale, vars: { rule } })).catch(() => null); } catch {}
        try {
            modstore.push(client.database, 'cases', message.guildId, { action: 'automod-timeout', userId: message.author.id, modId: client.user.id, reason: rule });
        } catch {}
    }
    await sendLog(client, message.guildId, 'mod', {
        title: 'Automod',
        description: t('engine.automod_warned', { locale, vars: { rule } }) + ' — <@' + message.author.id + '> em <#' + message.channelId + '>',
        sourceChannelId: message.channelId,
    });
    try {
        await message.channel.send({ embeds: [infoEmbed(locale, t('engine.automod_warned', { locale, vars: { rule } }) + ' <@' + message.author.id + '>')] })
            .then((m) => setTimeout(() => m.delete().catch(() => null), 8000)).catch(() => null);
    } catch {}
}

async function runAutomod(client, message, locale) {
    const { guildId, content } = message;
    const rules = client.database.get('automod-' + guildId) || {};
    const enabled = (r) => rules[r] && rules[r].enabled;
    if (!enabled('spam') && !enabled('invite') && !enabled('link') && !enabled('caps') && !enabled('badwords')) return false;
    // Bypass padrão: quem pode gerenciar mensagens + whitelist do /automod exempt.
    try {
        if (message.member?.permissions?.has('ManageMessages')) return false;
    } catch {}
    const exempt = client.database.get('automod-exempt-' + guildId) || { roles: [], channels: [] };
    if (isExempt(message.member, message.channelId, exempt)) return false;
    const action = client.database.get('automod-action-' + guildId) || 'delete';
    const text = String(content || '');
    const low = text.toLowerCase();

    if (enabled('badwords')) {
        const bad = client.database.get('badwords-' + guildId) || [];
        if (bad.some((w) => w && low.includes(String(w).toLowerCase()))) {
            await punish(client, message, locale, 'badwords', action);
            return true;
        }
    }
    if ((enabled('invite') || enabled('link')) && /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)/i.test(text)) {
        await punish(client, message, locale, 'invite', action);
        return true;
    }
    if (enabled('caps') && text.length >= 12) {
        const letters = text.replace(/[^A-Za-zÀ-ÿ]/g, '');
        if (letters.length >= 10) {
            const upper = letters.replace(/[^A-ZÀ-Þ]/g, '').length;
            if (upper / letters.length >= 0.7) {
                await punish(client, message, locale, 'caps', action);
                return true;
            }
        }
    }
    if (enabled('spam')) {
        const k = guildId + ':' + message.author.id;
        const now = Date.now();
        const arr = (spamHits.get(k) || []).filter((ts) => now - ts < 6000);
        arr.push(now);
        spamHits.set(k, arr);
        if (arr.length >= 6) {
            spamHits.set(k, []);
            await punish(client, message, locale, 'spam', action);
            return true;
        }
    }
    return false;
}

async function runAFK(client, message, locale) {
    const all = client.database.get('afk-' + message.guildId) || {};
    let touched = false;
    // 1) autor volta: remove AFK e avisa.
    if (all[message.author.id]) {
        delete all[message.author.id];
        touched = true;
        try { client.database.set('afk-' + message.guildId, all); } catch {}
        await message.reply({ embeds: [infoEmbed(locale, t('engine.afk_back', { locale, vars: { user: '<@' + message.author.id + '>' } }))] }).catch(() => null);
    }
    // 2) mencionou alguém AFK: responde com o motivo.
    try {
        const mentioned = [...message.mentions.users.values()].filter((u) => !u.bot && all[u.id]);
        if (mentioned.length) {
            const u = mentioned[0];
            const rec = all[u.id];
            await message.reply({ embeds: [infoEmbed(locale, t('engine.afk_mention', { locale, vars: { user: '<@' + u.id + '>', reason: rec.reason, ts: rec.ts } }))] }).catch(() => null);
        }
    } catch {}
    return touched;
}

async function runXP(client, message, locale) {
    const k = message.guildId + ':' + message.author.id;
    const now = Date.now();
    if (now - (xpCooldown.get(k) || 0) < 60000) return;
    xpCooldown.set(k, now);
    const key = 'xp-' + message.guildId;
    const store = client.database.get(key) || {};
    const d = store[message.author.id] || (store[message.author.id] = { xp: 0, level: 0 });
    d.xp += 15 + Math.floor(Math.random() * 11); // 15-25 XP por minuto ativo
    const newLevel = levelFor(d.xp);
    if (newLevel <= (d.level || 0)) {
        try { client.database.set(key, store); } catch {}
        return;
    }
    d.level = newLevel;
    try { client.database.set(key, store); } catch {}
    // Anuncia level-up: canal customizado de levelmsg-<guild>, senão o canal atual (ou DM).
    const cfg = client.database.get('levelmsg-' + message.guildId) || null;
    const text = formatLevelMsg(cfg && cfg.message ? cfg.message : t('engine.levelup', { locale, vars: { user: '<@' + message.author.id + '>', level: newLevel } }), message.member, newLevel);
    const embed = infoEmbed(locale, text);
    try {
        if (cfg && cfg.channel) {
            const ch = await client.channels.fetch(cfg.channel).catch(() => null);
            if (ch && ch.isTextBased()) await ch.send({ embeds: [embed] }).catch(() => null);
            else await message.channel.send({ embeds: [embed] }).catch(() => null);
        } else {
            await message.channel.send({ embeds: [embed] }).catch(() => message.author.send({ embeds: [embed] }).catch(() => null));
        }
    } catch {}
    // Role reward de levelrewards-<guild>.
    try {
        const rewards = client.database.get('levelrewards-' + message.guildId) || {};
        const roleId = rewards[newLevel] || rewards[String(newLevel)];
        if (roleId && message.member) {
            const role = await message.guild.roles.fetch(roleId).catch(() => null);
            if (role) await message.member.roles.add(role).catch(() => null);
        }
    } catch {}
}

async function runSticky(client, message) {
    try {
        const all = client.database.get('sticky-' + message.guildId) || {};
        const s = all[message.channelId];
        if (!s || !s.text) return;
        if (message.author.id === client.user.id) return;
        const oldId = s.lastId;
        const m = await message.channel.send(String(s.text).slice(0, 1900)).catch(() => null);
        if (oldId && m) {
            const old = await message.channel.messages.fetch(oldId).catch(() => null);
            if (old && old.author.id === client.user.id) await old.delete().catch(() => null);
        }
        if (m) {
            all[message.channelId] = { text: s.text, lastId: m.id };
            client.database.set('sticky-' + message.guildId, all);
        }
    } catch {}
}

async function runHighlights(client, message) {
    try {
        const all = client.database.get('highlights-' + message.guildId) || {};
        const low = String(message.content || '').toLowerCase();
        if (!low) return;
        for (const [userId, words] of Object.entries(all)) {
            if (userId === message.author.id) continue;
            if (message.mentions.users.has(userId)) continue;
            const hit = (words || []).find((w) => w && low.includes(String(w).toLowerCase()));
            if (hit) {
                const member = await message.guild.members.fetch(userId).catch(() => null);
                if (!member) continue;
                const locale = resolveLocale({ guildId: message.guildId });
                await member.send(t('engine.highlight', { locale, vars: { user: '<@' + userId + '>', word: hit } }) + '\n<#' + message.channelId + '>').catch(() => null);
                break;
            }
        }
    } catch {}
}

module.exports = new Event({
    event: 'messageCreate',
    once: false,
    run: async (__client__, message) => {
        try {
            if (!message || message.author?.bot) return;
            if (message.channel?.type === ChannelType.DM) return;
            if (!message.guildId) return;
            const locale = resolveLocale({ guildId: message.guildId });
            await runAFK(__client__, message, locale);
            const blocked = await runAutomod(__client__, message, locale);
            if (blocked) return; // mensagem apagada: não conta XP nem reposta sticky
            await runXP(__client__, message, locale);
            await runHighlights(__client__, message);
            await runSticky(__client__, message);
        } catch {}
    },
}).toJSON();
