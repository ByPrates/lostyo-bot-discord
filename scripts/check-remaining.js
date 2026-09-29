require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const GUILD_ID = '1388811770273075220';
const TARGETS = ['1388811771099222028', '1392833189264752730'];
(async () => {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  await client.login(process.env.CLIENT_TOKEN);
  const guild = await client.guilds.fetch(GUILD_ID);
  const me = await guild.members.fetchMe();
  console.log(`Bot roles: ${me.roles.cache.map(r => `${r.name}@${r.position}`).join(', ')}`);
  console.log(`Guild perms: ${me.permissions.toArray().join(', ')}`);
  console.log(`Has ManageChannels guild: ${me.permissions.has(PermissionFlagsBits.ManageChannels)}`);
  console.log(`Is admin: ${me.permissions.has(PermissionFlagsBits.Administrator)}`);
  for (const id of TARGETS) {
    try {
      const ch = await guild.channels.fetch(id);
      if (!ch) { console.log(`${id}: nao encontrado (ja apagado?)`); continue; }
      const perms = ch.permissionsFor(me);
      console.log(`--- ${ch.name} (${ch.id}) tipo=${ch.type}`);
      console.log(`deletable=${ch.deletable} manage=${perms?.has(PermissionFlagsBits.ManageChannels)} view=${perms?.has(PermissionFlagsBits.ViewChannel)} perms=[${perms?.toArray().join(', ')}]`);
    } catch (e) { console.log(`${id} erro: ${e.message}`); }
  }
  await client.destroy();
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
