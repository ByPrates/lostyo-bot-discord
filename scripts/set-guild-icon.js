require('dotenv').config();
const fs = require('fs');
const path = require('path');

const GUILD_ID = '1388811770273075220';
const imgPath = process.argv[2];
if (!imgPath) { console.error('Uso: node set-guild-icon.js <caminho-imagem>'); process.exit(1); }
const abs = path.resolve(imgPath);
if (!fs.existsSync(abs)) { console.error('Arquivo nao encontrado: ' + abs); process.exit(1); }
const stat = fs.statSync(abs);
if (stat.size > 8 * 1024 * 1024) { console.error('Imagem maior que 8MB, Discord recusa.'); process.exit(1); }

const ext = path.extname(abs).toLowerCase();
const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.gif' ? 'image/gif' : 'image/png';
const b64 = fs.readFileSync(abs).toString('base64');

(async () => {
  const r = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}`, {
    method: 'PATCH',
    headers: { Authorization: 'Bot ' + process.env.CLIENT_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ icon: `data:${mime};base64,${b64}` }),
  });
  const j = await r.json();
  if (!r.ok) { console.error('FAIL ' + r.status + ': ' + JSON.stringify(j).slice(0, 500)); process.exit(1); }
  console.log(`OK icone aplicado em: ${j.name} (${j.id})`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
