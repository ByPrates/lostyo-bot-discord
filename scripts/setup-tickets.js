require('dotenv').config();
const GUILD_ID = '1388811770273075220';
const H = () => ({ Authorization: 'Bot ' + process.env.CLIENT_TOKEN, 'Content-Type': 'application/json' });
(async () => {
  // 1) Categoria TICKETS
  const cat = await (await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
    method: 'POST', headers: H(),
    body: JSON.stringify({ name: 'TICKETS', type: 4 }),
    signal: AbortSignal.timeout(20000),
  })).json();
  console.log(`CAT TICKETS: ${cat.id || JSON.stringify(cat).slice(0, 200)}`);

  // 2) Trava vitrine: só bot/staff postam (anúncios via /anuncio)
  const lock = await (await fetch('https://discord.com/api/v10/channels/1554279603424596039', {
    method: 'PATCH', headers: H(),
    body: JSON.stringify({ permission_overwrites: [
      { id: GUILD_ID, type: 0, allow: '1024', deny: '2048' },
      { id: '1554279563285237851', type: 0, allow: '1024', deny: '0' },
      { id: '1554279566690754650', type: 0, allow: '1024', deny: '0' },
    ] }),
    signal: AbortSignal.timeout(20000),
  })).json();
  console.log(`VITRINE lock: ${lock.name || JSON.stringify(lock).slice(0, 200)}`);
  process.exit(0);
})().catch(e => { console.error('ERR ' + e.message); process.exit(1); });
