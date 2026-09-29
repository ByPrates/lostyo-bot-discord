require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const GUILD_ID = '1388811770273075220';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const token = process.env.CLIENT_TOKEN;
  if (!token) {
    console.error('CLIENT_TOKEN ausente no .env');
    process.exit(1);
  }
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  await client.login(token);
  const guild = await client.guilds.fetch(GUILD_ID);
  console.log(`Alvo: ${guild.name} (${guild.id})`);

  await guild.channels.fetch();
  await guild.roles.fetch();
  const me = await guild.members.fetchMe();

  const channels = [...guild.channels.cache.values()];
  console.log(`Canais encontrados: ${channels.length}`);
  let delCh = 0;
  for (const ch of channels) {
    try {
      if (!ch.deletable) {
        console.log(`SKIP canal sem permissão: ${ch.name} (${ch.id})`);
        continue;
      }
      await ch.delete('Wipe autorizado pelo dono');
      delCh++;
      console.log(`DEL canal: ${ch.name}`);
    } catch (e) {
      console.log(`FAIL canal ${ch.name}: ${e.message}`);
    }
    await sleep(600);
  }

  await guild.roles.fetch();
  const myRoleIds = new Set(me.roles.cache.keys());
  const roles = [...guild.roles.cache.values()];
  console.log(`Cargos encontrados: ${roles.length}`);
  let delR = 0, skipR = 0;
  // Ordena do menor para o maior para respeitar hierarquia
  roles.sort((a, b) => a.position - b.position);
  for (const role of roles) {
    if (role.id === guild.id) { console.log('SKIP @everyone'); skipR++; continue; }
    if (role.managed) { console.log(`SKIP gerenciado: ${role.name}`); skipR++; continue; }
    if (myRoleIds.has(role.id)) { console.log(`SKIP cargo do bot: ${role.name}`); skipR++; continue; }
    try {
      if (!role.editable) {
        console.log(`SKIP sem hierarquia: ${role.name}`);
        skipR++;
        continue;
      }
      await role.delete('Wipe autorizado pelo dono');
      delR++;
      console.log(`DEL cargo: ${role.name}`);
    } catch (e) {
      console.log(`FAIL cargo ${role.name}: ${e.message}`);
    }
    await sleep(600);
  }

  console.log(`FIM. Canais apagados: ${delCh}/${channels.length}. Cargos apagados: ${delR}, pulados: ${skipR}.`);
  await client.destroy();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
