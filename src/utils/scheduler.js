// Schedulers persistentes: tempban / tempmute (timeout) / giveaway / reminder.
// O problema: setTimeout some no restart. A solução: cada agendamento é salvo no DB
// (`sched-<guildId>` + espelho em `giveaways-<guildId>` para sorteios) e rearmado no
// boot via restoreSchedulers() (chamado no onReady). Atraso máximo do setTimeout é
// ~24 dias; acima disso o timer é rearmado em janelas (clamp + re-check no restore).
const { t, resolveLocale } = require('./i18n');

const MAX_TIMEOUT = 2147483647; // ~24.8 dias (limite do setTimeout)

function schedKey(guildId) {
    return 'sched-' + guildId;
}

function allSched(db, guildId) {
    return db.get(schedKey(guildId)) || [];
}

function saveSched(db, guildId, arr) {
    db.set(schedKey(guildId), arr);
}

function addSched(db, guildId, rec) {
    const arr = allSched(db, guildId);
    const full = { id: (arr.length ? arr[arr.length - 1].id : 0) + 1, createdAt: Date.now(), ...rec };
    arr.push(full);
    saveSched(db, guildId, arr);
    return full;
}

function removeSched(db, guildId, id) {
    saveSched(db, guildId, allSched(db, guildId).filter((s) => s.id !== id));
}

// Executa a ação de um agendamento vencido.
async function fireSched(client, guildId, rec) {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) return;
    try {
        if (rec.kind === 'tempban') {
            await guild.bans.remove(rec.userId, 'Tempban expired').catch(() => null);
        } else if (rec.kind === 'tempmute') {
            const m = await guild.members.fetch(rec.userId).catch(() => null);
            if (m) await m.timeout(null).catch(() => null);
        } else if (rec.kind === 'reminder') {
            const user = await client.users.fetch(rec.userId).catch(() => null);
            const locale = resolveLocale({ guildId });
            if (user) await user.send(t('reminder.dm', { locale, vars: { text: rec.text } })).catch(() => null);
        } else if (rec.kind === 'giveaway') {
            await finishGiveaway(client, guildId, rec.giveawayId);
        }
    } catch {}
}

// Arma o timer (com clamp para o limite do setTimeout).
function armSched(client, guildId, rec) {
    const delay = Math.max(0, (rec.endsAt || 0) - Date.now());
    const step = Math.min(delay, MAX_TIMEOUT);
    setTimeout(async () => {
        if (Date.now() < (rec.endsAt || 0)) return armSched(client, guildId, rec); // janela intermediária
        try { removeSched(client.database, guildId, rec.id); } catch {}
        await fireSched(client, guildId, rec);
    }, step);
}

function scheduleKind(client, guildId, kind, payload, endsAt) {
    const rec = addSched(client.database, guildId, { kind, endsAt, ...payload });
    armSched(client, guildId, rec);
    return rec;
}

// Sorteio: sorteia vencedores das reações e marca ended.
async function finishGiveaway(client, guildId, giveawayId) {
    const key = 'giveaways-' + guildId;
    const arr = client.database.get(key) || [];
    const g = arr.find((x) => x.id === giveawayId);
    if (!g || g.ended) return null;
    g.ended = true;
    client.database.set(key, arr);
    const locale = resolveLocale({ guildId });
    try {
        const ch = await client.channels.fetch(g.channelId).catch(() => null);
        const m = ch ? await ch.messages.fetch(g.messageId).catch(() => null) : null;
        const reaction = m ? m.reactions.resolve('🎉') : null;
        const usersMap = reaction ? await reaction.users.fetch().catch(() => new Map()) : new Map();
        const users = [...(usersMap?.values ? usersMap.values() : [])].filter((u) => !u.bot);
        const wins = users.sort(() => Math.random() - 0.5).slice(0, g.winners || 1);
        g.winnerIds = wins.map((u) => u.id);
        client.database.set(key, arr);
        if (ch && ch.isTextBased()) {
            await ch.send(wins.length
                ? t('giveaway.won', { locale, vars: { users: wins.map((u) => '<@' + u.id + '>').join(' '), prize: g.prize } })
                : t('giveaway.nobody', { locale }));
        }
        return g;
    } catch {
        return g;
    }
}

// Rearma tudo no boot. Chamado uma vez no onReady.
async function restoreSchedulers(client) {
    let armed = 0;
    let keys = [];
    try { keys = client.database.keys(); } catch { keys = []; }
    // 1) agendamentos genéricos (tempban/tempmute/reminder/giveaway)
    for (const k of keys) {
        if (!k.startsWith('sched-')) continue;
        const guildId = k.slice('sched-'.length);
        for (const rec of allSched(client.database, guildId)) {
            if (!rec || !rec.endsAt) continue;
            if (rec.endsAt <= Date.now()) { fireSched(client, guildId, rec).catch(() => null); removeSched(client.database, guildId, rec.id); }
            else { armSched(client, guildId, rec); armed++; }
        }
    }
    // 2) giveaways legados/abertos que não têm entrada em sched- (compat).
    for (const k of keys) {
        if (!k.startsWith('giveaways-')) continue;
        const guildId = k.slice('giveaways-'.length);
        const list = client.database.get(k) || [];
        for (const g of list) {
            if (!g || g.ended || !g.endsAt) continue;
            if (g.endsAt <= Date.now()) { finishGiveaway(client, guildId, g.id).catch(() => null); }
            else {
                const rec = addSched(client.database, guildId, { kind: 'giveaway', giveawayId: g.id, endsAt: g.endsAt });
                armSched(client, guildId, rec);
                armed++;
            }
        }
    }
    return armed;
}

module.exports = { scheduleKind, finishGiveaway, restoreSchedulers, armSched, fireSched };
