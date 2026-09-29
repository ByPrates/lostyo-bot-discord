// Camada de persistência do bot: QuickYAML (local, síncrono) + Supabase (opcional, remoto).
//
// Como funciona:
// - Sem SUPABASE_URL + SUPABASE_KEY (ou SUPABASE_ANON_KEY): 100% QuickYAML, zero mudança.
// - Com as vars: mantém a mesma interface síncrona get/set/has/delete (lida do cache
//   local QuickYAML) e espelha escritas no Supabase em background (write-through, sem
//   quebrar o bot se a rede falhar). No boot, `syncFromRemote()` puxa o kv_store remoto
//   para o cache local (remoto vence em caso de divergência).
// - Tabela remota: kv_store(guild_id TEXT, key TEXT, value JSONB). Ver src/db/schema.sql.
const fs = require('node:fs');
const path = require('node:path');
const { QuickYAML } = require('quick-yaml.db');

function getEnv(name, fallback = undefined) {
    const v = process.env[name];
    return v === undefined || v === '' ? fallback : v;
}

// Heurística: chaves locais são `<prefixo>-<guildId>[-<userId>]`.
// O guildId é o primeiro segmento snowflake (17-20 dígitos) da chave.
function extractGuildId(localKey) {
    const m = String(localKey).split('-').find((p) => /^\d{17,20}$/.test(p));
    return m || 'global';
}

function tryCreateSupabase() {
    const url = getEnv('SUPABASE_URL');
    const key = getEnv('SUPABASE_KEY') || getEnv('SUPABASE_ANON_KEY') || getEnv('SUPABASE_SERVICE_KEY');
    if (!url || !key) return null;
    try {
        const { createClient } = require('@supabase/supabase-js');
        return createClient(url, key);
    } catch {
        return null;
    }
}

class HybridDB {
    constructor(path) {
        try {
            const resolved = path && path.startsWith('/') ? path : path && /^[A-Za-z]:\\/.test(path) ? path : require('node:path').resolve(process.cwd(), path || './database.yml');
            require('node:fs').mkdirSync(require('node:path').dirname(resolved), { recursive: true });
            if (!require('node:fs').existsSync(resolved)) require('node:fs').writeFileSync(resolved, '', 'utf-8');
        } catch {}
        this.yaml = new QuickYAML(path);
        this.sb = tryCreateSupabase();
        this.backend = this.sb ? 'supabase+yaml' : 'yaml';
        this._pending = 0;
    }

    get usingRemote() {
        return !!this.sb;
    }

    // ---- interface síncrona (compatível com QuickYAML; usada por todos os comandos) ----
    get(key, def) {
        try {
            const v = this.yaml.get(key);
            return v === undefined || v === null ? def : v;
        } catch {
            return def;
        }
    }

    set(key, value) {
        this.yaml.set(key, value);
        this._push(key, value);
        return value;
    }

    has(key) {
        try {
            return this.yaml.has(key);
        } catch {
            return false;
        }
    }

    delete(key) {
        try {
            this.yaml.delete(key);
        } catch {}
        this._remove(key);
    }

    // Delegações úteis (schedulers/API).
    keys() { try { return this.yaml.keys(); } catch { return []; } }
    entries() { try { return this.yaml.entries(); } catch { return []; } }
    get size() { try { return this.yaml.size; } catch { return 0; } }

    // ---- sync remoto (async, best-effort) ----
    _push(key, value) {
        if (!this.sb) return;
        this._pending++;
        const row = { guild_id: extractGuildId(key), key: String(key), value: { v: value === undefined ? null : value } };
        this.sb.from('kv_store').upsert(row, { onConflict: 'guild_id,key' }).then(
            () => { this._pending--; },
            () => { this._pending--; } // falha silenciosa: o YAML local continua valendo
        );
    }

    _remove(key) {
        if (!this.sb) return;
        this._pending++;
        this.sb.from('kv_store').delete().eq('guild_id', extractGuildId(key)).eq('key', String(key)).then(
            () => { this._pending--; },
            () => { this._pending--; }
        );
    }

    // Puxa tudo do Supabase para o cache local. Chamar uma vez no boot (onReady).
    async syncFromRemote() {
        if (!this.sb) return { ok: false, reason: 'no-supabase' };
        try {
            const { data, error } = await this.sb.from('kv_store').select('key,value');
            if (error) return { ok: false, reason: String(error.message || error) };
            let n = 0;
            for (const row of data || []) {
                if (!row || typeof row.key !== 'string') continue;
                const v = row.value && typeof row.value === 'object' && 'v' in row.value ? row.value.v : row.value;
                try { this.yaml.set(row.key, v); n++; } catch {}
            }
            return { ok: true, keys: n };
        } catch (e) {
            return { ok: false, reason: String(e && e.message || e) };
        }
    }
}

function createDatabase(path) {
    return new HybridDB(path);
}

module.exports = { HybridDB, createDatabase, extractGuildId };
