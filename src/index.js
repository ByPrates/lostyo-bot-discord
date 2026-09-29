require('dotenv').config();
const fs = require('fs');
const DiscordBot = require('./client/DiscordBot');

try { fs.writeFileSync('./terminal.log', '', 'utf-8'); } catch {}

// Anti-crash global: loga e continua — nunca derruba o processo.
function logCrash(tag, err) {
    try {
        const msg = err && err.stack ? err.stack : String(err);
        console.error(`[ANTI-CRASH] ${tag}:`, msg);
        try { fs.appendFileSync('./terminal.log', `\n[ANTI-CRASH] ${tag}: ${msg}\n`); } catch {}
    } catch {}
}

process.on('unhandledRejection', (err) => logCrash('unhandledRejection', err));
process.on('uncaughtException', (err) => logCrash('uncaughtException', err));
process.on('warning', (w) => logCrash('warning', w && w.stack ? w.stack : String(w)));

const client = new DiscordBot();

module.exports = client;

// Erros de conexão do gateway: avisa e tenta reconectar, sem crash.
client.on('error', (e) => logCrash('client/error', e));
client.on('shardError', (e) => logCrash('client/shardError', e));
client.on('shardDisconnect', (e) => logCrash('client/shardDisconnect', e));

client.connect();

// Heartbeat pra plataforma ver que tá vivo (não faz nada pesado).
setInterval(() => {}, 60_000).unref?.();
