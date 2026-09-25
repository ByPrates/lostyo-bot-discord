// Loop de alertas externos (a cada 10min, chamado no onReady).
// Formato salvo pelos comandos /alerts: `alerts-<guildId>` = [{ type, source, channel }]
// onde type é alert-youtube | alert-twitch | alert-kick | alert-tiktok | alert-reddit | alert-rss.
// Último item postado por alerta: `alertstate-<guildId>` = { [index]: lastId }.
// YouTube com source = channel ID (UC...) usa RSS público sem chave.
// Twitch/Kick/TikTok/Reddit/RSS genérico sem chave/API: stubs logados (documentado no retorno).
const { EmbedBuilder } = require('discord.js');
const { WHITE } = require('./embeds');
const { resolveLocale, t } = require('./i18n');
const { info } = require('./Console');

function alertTarget(a) {
    return a.channel || a.channelId || null;
}

function isYouTubeChannelId(source) {
    return /^UC[\w-]{20,}$/.test(String(source || '').trim());
}

function parseYouTubeRSS(xml) {
    const items = [];
    const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
    let m;
    while ((m = entryRe.exec(xml)) && items.length < 10) {
        const body = m[1];
        const id = (/<yt:videoId>([^<]+)<\/yt:videoId>/.exec(body) || [])[1] || null;
        const title = (/<title>([^<]*)<\/title>/.exec(body) || [])[1] || 'YouTube';
        const link = (/<link[^>]*href="([^"]+)"/.exec(body) || [])[1] || (id ? 'https://youtu.be/' + id : null);
        if (id) items.push({ id, title, link });
    }
    return items;
}

async function checkYouTube(client, guild, alert, index, state, locale) {
    const source = String(alert.source || '').trim();
    if (!isYouTubeChannelId(source)) {
        info('[alerts] YouTube stub (sem channel ID; sem chave de API): guild ' + guild.id + ' source "' + source + '"');
        return { posted: false, stub: 'youtube-needs-channel-id' };
    }
    try {
        const res = await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + encodeURIComponent(source));
        if (!res.ok) return { posted: false, stub: 'youtube-http-' + res.status };
        const items = parseYouTubeRSS(await res.text());
        if (!items.length) return { posted: false, stub: null };
        const latest = items[0];
        if (state[index] === latest.id) return { posted: false, stub: null };
        const isFirst = !state[index];
        state[index] = latest.id;
        if (isFirst) return { posted: false, stub: null }; // baseline: não spamma o histórico
        const ch = await client.channels.fetch(alertTarget(alert)).catch(() => null);
        if (ch && ch.isTextBased()) {
            const embed = new EmbedBuilder().setColor(WHITE)
                .setTitle(t('alerts.youtube_title', { locale }))
                .setDescription('**' + latest.title + '**\n' + (latest.link || ''))
                .setTimestamp();
            await ch.send({ embeds: [embed] }).catch(() => null);
            return { posted: true, stub: null };
        }
        return { posted: false, stub: null };
    } catch (e) {
        return { posted: false, stub: 'youtube-error' };
    }
}

// Varre todos os servidores do cache. Retorna resumo para log.
async function checkAlerts(client) {
    const summary = { youtube: 0, stubs: {} };
    for (const [, guild] of client.guilds.cache) {
        let alerts = [];
        try { alerts = client.database.get('alerts-' + guild.id) || []; } catch { alerts = []; }
        if (!alerts.length) continue;
        const locale = resolveLocale({ guildId: guild.id });
        const stateKey = 'alertstate-' + guild.id;
        const state = client.database.get(stateKey) || {};
        let dirty = false;
        for (let i = 0; i < alerts.length; i++) {
            const a = alerts[i];
            if (!a || !alertTarget(a)) continue;
            const type = String(a.type || '');
            if (type === 'alert-youtube') {
                const r = await checkYouTube(client, guild, a, String(i), state, locale);
                if (r.posted) { summary.youtube++; dirty = true; }
                else if (r.stub && r.stub !== 'youtube-needs-channel-id' && state[String(i)]) dirty = true;
                else if (state[String(i)] !== undefined) dirty = true;
                if (r.stub) summary.stubs[type + ':' + r.stub] = (summary.stubs[type + ':' + r.stub] || 0) + 1;
            } else if (['alert-twitch', 'alert-kick', 'alert-tiktok', 'alert-reddit', 'alert-rss'].includes(type)) {
                // Sem OAuth/chave não há polling público confiável: stub logado (uma linha por ciclo).
                summary.stubs[type + ':needs-api-key'] = (summary.stubs[type + ':needs-api-key'] || 0) + 1;
            }
        }
        if (dirty) { try { client.database.set(stateKey, state); } catch {} }
    }
    const stubKeys = Object.keys(summary.stubs);
    if (stubKeys.length) info('[alerts] stubs (precisam de chave/API): ' + stubKeys.map((k) => k + 'x' + summary.stubs[k]).join(', '));
    if (summary.youtube) info('[alerts] YouTube: ' + summary.youtube + ' vídeo(s) postado(s).');
    return summary;
}

module.exports = { checkAlerts };
