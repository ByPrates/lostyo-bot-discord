require('dotenv').config();
const GUILD_ID = '1388811770273075220';
const MAP = {
  '📢┃INFORMAÇÕES': 'INFORMAÇÕES',
  '🛒┃VITRINE': 'VITRINE',
  '🤝┃NEGOCIAÇÃO': 'NEGOCIAÇÃO',
  '💬┃GERAL': 'GERAL',
};
const H = () => ({ Authorization: 'Bot ' + process.env.CLIENT_TOKEN, 'Content-Type': 'application/json' });
(async () => {
  const list = await (await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, { headers: H() })).json();
  for (const [oldName, newName] of Object.entries(MAP)) {
    const c = list.find(x => x.name === oldName && x.type === 4);
    if (!c) { console.log(`NAO ACHADA: ${oldName}`); continue; }
    const r = await fetch(`https://discord.com/api/v10/channels/${c.id}`, {
      method: 'PATCH', headers: H(), body: JSON.stringify({ name: newName }),
    });
    console.log(`${r.ok ? 'OK' : 'FAIL'} ${oldName} -> ${newName}`);
  }
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
