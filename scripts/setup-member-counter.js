require('dotenv').config();
const { QuickYAML } = require('quick-yaml.db');
const path = require('path');

const GUILD_ID = '1388811770273075220';
const H = () => ({ Authorization: 'Bot ' + process.env.CLIENT_TOKEN, 'Content-Type': 'application/json' });

(async () => {
  // 1) Contagem atual
  const g = await (await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}?with_counts=true`, { headers: H() })).json();
  const n = g.approximate_member_count ?? 0;
  console.log(`Membros: ${n}`);

  // 2) Canal de voz bloqueado (ver, sem conectar) no topo
  const ch = await (await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
    method: 'POST', headers: H(),
    body: JSON.stringify({
      name: `👥 Membros: ${n}`,
      type: 2,
      position: 0,
      permission_overwrites: [{ id: GUILD_ID, type: 0, allow: '1024', deny: '1048576' }],
    }),
  })).json();
  if (!ch.id) { console.error('FAIL criar canal: ' + JSON.stringify(ch).slice(0, 300)); process.exit(1); }
  console.log(`CANAL criado: ${ch.name} (${ch.id})`);

  // 3) Registra no banco do bot p/ o loop atualizar a cada 30min
  const db = new QuickYAML(path.join(__dirname, '..', 'database.yml'));
  const key = 'counters-' + GUILD_ID;
  const all = db.get(key) || [];
  if (!all.some(c => c.channelId === ch.id)) { all.push({ channelId: ch.id, type: 'members' }); db.set(key, all); }
  console.log('DB counters registrado.');
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
