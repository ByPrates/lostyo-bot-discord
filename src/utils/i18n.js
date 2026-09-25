// Sistema de internacionalização (i18n) do bot.
// Como funciona:
// 1. Textos ficam em src/locales/<locale>.json (ex: pt-BR, en-US).
// 2. Cada servidor pode fixar um idioma via /idioma (salvo como `locale-<guildId>` no database).
// 3. Sem idioma fixo, usa o idioma do Discord do usuário (interaction.locale) com fallback pro padrão.
// Uso: t('handler.cooldown', { locale, vars: { cooldown: 5 } })
const fs = require('fs');
const path = require('path');
const config = require('../config');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const locales = new Map();

for (const file of fs.readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.json'))) {
    const name = path.basename(file, '.json');
    locales.set(name, JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, file), 'utf-8')));
}

let database = null;

// Chamado uma vez no construtor do DiscordBot (src/client/DiscordBot.js).
function setDatabase(db) {
    database = db;
}

function getSupportedLocales() {
    return config.i18n?.supportedLocales?.length ? config.i18n.supportedLocales : [...locales.keys()];
}

function getDefaultLocale() {
    const def = config.i18n?.defaultLocale || 'pt-BR';
    return locales.has(def) ? def : [...locales.keys()][0];
}

// Normaliza 'en-GB' -> 'en-US', 'pt' -> 'pt-BR', etc. Desconhecido -> padrão.
function normalizeLocale(input) {
    if (!input) return getDefaultLocale();
    const supported = getSupportedLocales();
    if (supported.includes(input)) return input;
    const base = String(input).split('-')[0].toLowerCase();
    return supported.find((l) => l.toLowerCase() === base || l.toLowerCase().startsWith(base + '-'))
        || getDefaultLocale();
}

function getGuildLocale(guildId) {
    if (guildId && database) {
        try {
            const saved = database.get('locale-' + guildId);
            if (saved) return normalizeLocale(saved);
        } catch {}
    }
    return null;
}

function setGuildLocale(guildId, locale) {
    const normalized = normalizeLocale(locale);
    if (!getSupportedLocales().includes(normalized)) return null;
    database?.set('locale-' + guildId, normalized);
    return normalized;
}

// Prioridade: idioma do servidor > idioma do Discord do usuário > padrão.
function resolveLocale({ guildId = null, discordLocale = null } = {}) {
    return getGuildLocale(guildId) || normalizeLocale(discordLocale);
}

function lookup(locale, key) {
    return key.split('.').reduce((obj, part) => (obj && typeof obj === 'object' ? obj[part] : undefined), locales.get(locale));
}

function t(key, { locale = getDefaultLocale(), vars = {} } = {}) {
    const template = lookup(locale, key) ?? lookup(getDefaultLocale(), key) ?? key;
    if (typeof template !== 'string') return key;
    return template.replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? `{${name}}`));
}

module.exports = {
    setDatabase,
    getSupportedLocales,
    getDefaultLocale,
    normalizeLocale,
    getGuildLocale,
    setGuildLocale,
    resolveLocale,
    t,
};
