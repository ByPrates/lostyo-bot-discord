require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');
const GUILD_ID = '1388811770273075220';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  await client.login(process.env.CLIENT_TOKEN);
  const guild = await client.guilds.fetch(GUILD_ID);
  await guild.roles.fetch();
  await guild.channels.fetch();
  const me = await guild.members.fetchMe();
  console.log(`Guild: ${guild.name}`);

  const wantRoles = [
    { name: 'Staff', color: 0x3498db, perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.KickMembers, PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageThreads, PermissionFlagsBits.ViewAuditLog] },
    { name: 'Intermediador', color: 0x2ecc71, perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageThreads] },
    { name: 'Vendedor Verificado', color: 0xf1c40f, perms: [] },
    { name: 'Members', color: 0x95a5a6, perms: [] },
  ];
  const roleMap = {};
  for (const w of wantRoles) {
    let r = guild.roles.cache.find(x => x.name === w.name);
    if (!r) {
      r = await guild.roles.create({ name: w.name, color: w.color, permissions: w.perms, reason: 'Setup marketplace escrow' });
      console.log(`ROLE criada: ${w.name}`);
    } else {
      console.log(`ROLE existe: ${w.name}`);
    }
    roleMap[w.name] = r;
    await sleep(500);
  }
  const everyone = guild.roles.everyone;
  const staff = roleMap['Staff'];
  const founder = guild.roles.cache.find(x => x.name === 'Founder');

  const wantCats = ['INFORMAÇÕES', 'VITRINE', 'NEGOCIAÇÃO', 'GERAL'];
  const catMap = {};
  for (const name of wantCats) {
    let c = guild.channels.cache.find(x => x.type === ChannelType.GuildCategory && x.name === name);
    if (!c) {
      c = await guild.channels.create({ name, type: ChannelType.GuildCategory, reason: 'Setup marketplace' });
      console.log(`CAT criada: ${name}`);
    } else console.log(`CAT existe: ${name}`);
    catMap[name] = c;
    await sleep(500);
  }

  const T = (id) => ({ id, allow: [], deny: [] });
  const allowSend = (id) => ({ id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory], deny: [] });
  const denySend = (id) => ({ id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory], deny: [PermissionFlagsBits.SendMessages] });

  const wantChannels = [
    { cat: 'INFORMAÇÕES', name: '📢┃anúncios', topic: 'Anúncios oficiais — só staff', overwrites: [denySend(everyone.id), ...(founder ? [allowSend(founder.id)] : []), allowSend(staff.id)] },
    { cat: 'INFORMAÇÕES', name: '❓┃como-funciona-taxas', topic: 'Como funciona o intermédio + taxa', overwrites: [denySend(everyone.id), allowSend(staff.id)] },
    { cat: 'INFORMAÇÕES', name: '🆘┃suporte', topic: 'Dúvidas gerais', overwrites: [] },
    { cat: 'VITRINE', name: '📸┃divulgar-contas', topic: 'MODELO: Jogo | Rank/Skins | Preço | Contato | Só conta com email total', slowmode: 3600, overwrites: [] },
    { cat: 'VITRINE', name: '🔥┃ofertas-destaque', topic: 'Só Vendedor Verificado + Staff', overwrites: [denySend(everyone.id), allowSend(roleMap['Vendedor Verificado'].id), allowSend(staff.id)] },
    { cat: 'VITRINE', name: '✅┃vendidas', topic: 'Vendas concluídas', overwrites: [denySend(everyone.id), allowSend(staff.id)] },
    { cat: 'NEGOCIAÇÃO', name: '🎫┃abrir-ticket', topic: 'Abra ticket com /ticket — intermédio com taxa', overwrites: [denySend(everyone.id), allowSend(staff.id)] },
    { cat: 'NEGOCIAÇÃO', name: '⭐┃vouches', topic: 'Feedbacks pós-venda', overwrites: [denySend(everyone.id), allowSend(staff.id)] },
    { cat: 'NEGOCIAÇÃO', name: '⛔┃denuncias-blacklist', topic: 'Denúncias + blacklist — só staff posta', overwrites: [denySend(everyone.id), allowSend(staff.id)] },
    { cat: 'GERAL', name: '💬┃chat-geral', topic: 'Conversa geral', overwrites: [] },
  ];

  for (const w of wantChannels) {
    let ch = guild.channels.cache.find(x => x.name === w.name && x.parentId === catMap[w.cat].id);
    if (!ch) ch = guild.channels.cache.find(x => x.name === w.name);
    if (!ch) {
      ch = await guild.channels.create({ name: w.name, type: ChannelType.GuildText, parent: catMap[w.cat].id, topic: w.topic, rateLimitPerUser: w.slowmode || 0, permissionOverwrites: w.overwrites, reason: 'Setup marketplace' });
      console.log(`CANAL criado: ${w.name}`);
    } else {
      try {
        await ch.setParent(catMap[w.cat].id);
        if (w.topic) await ch.setTopic(w.topic);
        if (w.slowmode) await ch.setRateLimitPerUser(w.slowmode);
        if (w.overwrites?.length) await ch.permissionOverwrites.set(w.overwrites);
        console.log(`CANAL ok: ${w.name}`);
      } catch (e) { console.log(`CANAL fail ${w.name}: ${e.message}`); }
    }
    await sleep(600);
  }

  console.log('FIM setup marketplace.');
  await client.destroy();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
