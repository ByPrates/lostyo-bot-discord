// API HTTP embutida bot <-> dashboard (node:http, sem express).
// Sobe junto ao bot em BOT_API_PORT (default 3001). Ver docs/bot-api.md.
const http = require('node:http');
const { URL } = require('node:url');
const { resolveLocale } = require('../utils/i18n');
const modstore = require('../utils/modstore');

function sendJson(res, status, origin, obj) {
    const body = JSON.stringify(obj);
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) };
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    res.writeHead(status, headers);
    res.end(body);
}

function readBody(req) {
    return new Promise((resolve) => {
        let buf = '';
        req.on('data', (c) => { buf += c; if (buf.length > 1e6) req.destroy(); });
        req.on('end', () => {
            if (!buf) return resolve(null);
            try { resolve(JSON.parse(buf)); } catch { resolve(undefined); }
        });
        req.on('error', () => resolve(undefined));
    });
}

function startApiServer(client) {
    const port = Number(process.env.BOT_API_PORT || 3001);
    const secret = process.env.DASHBOARD_API_SECRET || '';
    const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');

    const server = http.createServer(async (req, res) => {
        try {
            const origin = req.headers.origin || '';
            const allowedOrigin = siteUrl && origin === siteUrl ? siteUrl : null;
            // Preflight CORS (só SITE_URL).
            if (req.method === 'OPTIONS') {
                const h = { 'Content-Length': '0' };
                if (allowedOrigin) {
                    h['Access-Control-Allow-Origin'] = allowedOrigin;
                    h['Access-Control-Allow-Headers'] = 'Content-Type, x-api-key';
                    h['Access-Control-Allow-Methods'] = 'GET, PUT, OPTIONS';
                }
                res.writeHead(204, h);
                return res.end();
            }

            const url = new URL(req.url || '/', 'http://localhost');
            const path = url.pathname;

            // Health pública (sem auth) para uptime checks.
            if (req.method === 'GET' && path === '/api/health') {
                return sendJson(res, 200, allowedOrigin, { ok: true, guilds: client.guilds.cache.size, uptime: Math.floor(process.uptime()) });
            }

            if (!path.startsWith('/api/guilds/')) return sendJson(res, 404, allowedOrigin, { error: 'not_found' });

            // Auth: x-api-key == DASHBOARD_API_SECRET.
            if (!secret) return sendJson(res, 503, allowedOrigin, { error: 'api_not_configured' });
            if (req.headers['x-api-key'] !== secret) return sendJson(res, 401, allowedOrigin, { error: 'unauthorized' });

            const parts = path.split('/').filter(Boolean); // ['api','guilds',':id',...]
            const guildId = parts[2];
            const rest = parts.slice(3).join('/');
            if (!/^\d{17,20}$/.test(guildId || '')) return sendJson(res, 400, allowedOrigin, { error: 'invalid_guild_id' });
            const guild = client.guilds.cache.get(guildId);
            if (!guild) return sendJson(res, 404, allowedOrigin, { error: 'guild_not_found' });
            const db = client.database;

            if (req.method === 'GET' && rest === 'settings') {
                return sendJson(res, 200, allowedOrigin, {
                    guildId,
                    language: db.get('locale-' + guildId) || resolveLocale({ guildId }),
                    prefix: db.get('prefix-' + guildId) || null,
                });
            }

            if (req.method === 'PUT' && rest === 'settings') {
                const body = await readBody(req);
                if (body === undefined) return sendJson(res, 400, allowedOrigin, { error: 'invalid_json' });
                const out = {};
                if (body && typeof body.language === 'string') {
                    const { setGuildLocale } = require('../utils/i18n');
                    const saved = setGuildLocale(guildId, body.language);
                    if (!saved) return sendJson(res, 400, allowedOrigin, { error: 'invalid_language' });
                    out.language = saved;
                }
                if (body && body.prefix !== undefined) {
                    if (body.prefix !== null && (typeof body.prefix !== 'string' || !body.prefix)) {
                        return sendJson(res, 400, allowedOrigin, { error: 'invalid_prefix' });
                    }
                    if (body.prefix === null) db.delete('prefix-' + guildId);
                    else db.set('prefix-' + guildId, body.prefix);
                    out.prefix = body.prefix;
                }
                return sendJson(res, 200, allowedOrigin, {
                    guildId,
                    language: db.get('locale-' + guildId) || resolveLocale({ guildId }),
                    prefix: db.get('prefix-' + guildId) || null,
                    updated: out,
                });
            }

            if (req.method === 'GET' && rest === 'cases') {
                const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
                const cases = modstore.all(db, 'cases', guildId).slice(-limit).reverse();
                return sendJson(res, 200, allowedOrigin, { guildId, cases });
            }

            if (req.method === 'GET' && rest === 'levels') {
                const store = db.get('xp-' + guildId) || {};
                const entries = Object.entries(store)
                    .map(([userId, d]) => ({ userId, xp: d.xp || 0, level: d.level || 0 }))
                    .sort((a, b) => b.xp - a.xp)
                    .slice(0, 100);
                return sendJson(res, 200, allowedOrigin, {
                    guildId,
                    entries,
                    rewards: db.get('levelrewards-' + guildId) || {},
                    levelMessage: db.get('levelmsg-' + guildId) || null,
                });
            }

            if (req.method === 'GET' && rest === 'economy') {
                const store = db.get('eco-' + guildId) || {};
                const balances = Object.entries(store)
                    .map(([userId, d]) => ({ userId, wallet: d.wallet || 0, bank: d.bank || 0 }))
                    .sort((a, b) => (b.wallet + b.bank) - (a.wallet + a.bank))
                    .slice(0, 100);
                return sendJson(res, 200, allowedOrigin, {
                    guildId,
                    currency: db.get('currency-' + guildId) || 'coins',
                    balances,
                    shop: db.get('shop-' + guildId) || [],
                });
            }

            return sendJson(res, 404, allowedOrigin, { error: 'not_found' });
        } catch {
            try { sendJson(res, 500, null, { error: 'internal' }); } catch {}
        }
    });

    server.listen(port, () => {
        try { require('../utils/Console').success('Bot API listening on port ' + port); } catch {}
    });
    return server;
}

module.exports = { startApiServer };
