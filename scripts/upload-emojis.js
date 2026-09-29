require('dotenv').config();
const fs = require('fs');
const path = require('path');
const GUILD_ID = '1388811770273075220';
const DIR = path.join(process.env.TEMP || process.env.TMP || '.', 'lostyo-emojis');
const H = () => ({ Authorization: 'Bot ' + process.env.CLIENT_TOKEN, 'Content-Type': 'application/json' });
(async () => {
  const names = ['ticket', 'anuncio', 'regras', 'ajuda', 'vouch', 'denuncia', 'news', 'chat', 'check'];
  const out = {};
  for (const n of names) {
    const b64 = fs.readFileSync(path.join(DIR, n + '.png')).toString('base64');
    const r = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/emojis`, {
      method: 'POST', headers: H(), signal: AbortSignal.timeout(20000),
      body: JSON.stringify({ name: n, image: 'data:image/png;base64,' + b64 }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { out[n] = j.id; console.log(`OK ${n}=${j.id}`); }
    else console.log(`FAIL ${n}: ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
    await new Promise(r2 => setTimeout(r2, 800));
  }
  console.log('MAP=' + JSON.stringify(out));
  process.exit(0);
})().catch(e => { console.error('ERR ' + e.message); process.exit(1); });
