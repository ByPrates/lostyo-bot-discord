// Boot: sync Supabase -> schedulers -> loops (alertas 10min, counters 30min).
const { success, info } = require('../../utils/Console');
const Event = require('../../structure/Event');

async function updateCounters(client) {
    let keys = [];
    try { keys = client.database.keys(); } catch { keys = []; }
    for (const k of keys) {
        if (!k.startsWith('counters-')) continue;
        const guildId = k.slice('counters-'.length);
        const guild = client.guilds.cache.get(guildId);
        if (!guild) continue;
        let list = [];
        try { list = client.database.get(k) || []; } catch { list = []; }
        for (const c of list) {
            try {
                const ch = await client.channels.fetch(c.channelId).catch(() => null);
                if (!ch) continue;
                let label = null;
                if (c.type === 'members') label = '👥 Membros: ' + guild.memberCount;
                else if (c.type === 'bots') {
                    try {
                        const members = await guild.members.fetch().catch(() => null);
                        label = 'Bots: ' + (members ? [...members.values()].filter((m) => m.user.bot).length : guild.members.cache.filter((m) => m.user.bot).size);
                    } catch { label = 'Bots: ' + guild.members.cache.filter((m) => m.user.bot).size; }
                }
                else if (c.type === 'roles') label = 'Roles: ' + guild.roles.cache.size;
                if (label && ch.name !== label) await ch.setName(label).catch(() => null);
            } catch {}
        }
    }
}

module.exports = new Event({
    event: 'clientReady',
    once: true,
    run: async (__client__, client) => {
        success('Logged in as ' + client.user.displayName + ', took ' + ((Date.now() - __client__.login_timestamp) / 1000) + 's.');

        // 1) Supabase -> cache local (se configurado; falha silenciosa).
        try {
            const r = await __client__.database.syncFromRemote?.();
            if (r && r.ok) info('[db] synced ' + r.keys + ' keys from Supabase (backend: ' + __client__.database.backend + ').');
            else info('[db] backend: ' + __client__.database.backend + '.');
        } catch {}

        // 2) Schedulers persistentes (tempban/tempmute/giveaway/reminder).
        try {
            const { restoreSchedulers } = require('../../utils/scheduler');
            const n = await restoreSchedulers(__client__);
            info('[sched] restored ' + n + ' pending timer(s).');
        } catch {}

        // 3) Alertas externos a cada 10min (primeira checagem com 60s de delay).
        try {
            const { checkAlerts } = require('../../utils/alerts');
            setTimeout(() => checkAlerts(__client__).catch(() => null), 60000);
            setInterval(() => checkAlerts(__client__).catch(() => null), 10 * 60 * 1000);
            info('[alerts] loop armed (10min).');
        } catch {}

        // 4) Contadores de membros a cada 30min (+ uma passada no boot).
        try {
            setTimeout(() => updateCounters(__client__).catch(() => null), 30000);
            setInterval(() => updateCounters(__client__).catch(() => null), 30 * 60 * 1000);
            info('[counters] loop armed (30min).');
        } catch {}
    },
}).toJSON();
