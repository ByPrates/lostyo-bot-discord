require('dotenv').config();
const fs = require('fs');
const path = require('path');
const GUILD_ID = '1388811770273075220';
const DIR = path.join(process.env.TEMP || process.env.TMP || '.', 'pack-emojis');
const OLD = {
  ticket: '1554297539031863369', anuncio: '1554297543964233729', regras: '1554297551820169246',
  ajuda: '1554297556291293307', vouch: '1554297570593869917', denuncia: '1554297576864489494',
  news: '1554297581595660349', chat: '1554297586549264394', check: '1554297592714887300',
};
const H = () => ({ Authorization: 'Bot ' + process.env.CLIENT_TOKEN, 'Content-Type': 'application/json' });
(async () => {
  for (const [n, id] of Object.entries(OLD)) {
    const r = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/emojis/${id}`, {
      method: 'DELETE', headers: H(), signal: AbortSignal.timeout(20000),
    });
    console.log(`DEL ${n}: ${r.status}`);
  }
  const out = {};
  for (const n of Object.keys(OLD)) {
    const b64 = fs.readFileSync(path.join(DIR, n + '.png')).toString('base64');
    const r = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/emojis`, {
      method: 'POST', headers: H(), signal: AbortSignal.timeout(20000),
      body: JSON.stringify({ name: n, image: 'data:image/png;base64,' + b64 }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { out[n] = j.id; console.log(`OK ${n}=${j.id}`); }
    else console.log(`FAIL ${n}: ${r.status}`);
    await new Promise(r2 => setTimeout(r2, 800));
  }
  console.log('MAP=' + JSON.stringify(out));
  process.exit(0);
})().catch(e => { console.error('ERR ' + e.message); process.exit(1); });
