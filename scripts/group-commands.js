// One-off migration: groups flat slash commands into top-level groups with subcommands.
// Outputs group-<name>.js (never collides with slashcommand-*.js, re-runnable).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'commands');

const GROUPS = [
  { group: 'mod', dir: 'Admin', emoji: '🔨', descEN: 'Moderation commands.', descPT: 'Comandos de moderação.', split: { from: 'Admin', exclude: ['slashcommand-language.js'], take: 25 } },
  { group: 'modtools', dir: 'Admin', emoji: '🔨', descEN: 'Extra moderation tools.', descPT: 'Ferramentas extras de moderação.', split: { from: 'Admin', exclude: ['slashcommand-language.js'], skip: 25 } },
  { group: 'automod', dir: 'Automod', emoji: '🛡️', descEN: 'Automod configuration.', descPT: 'Configuração do automod.' },
  { group: 'antiraid', dir: 'Antiraid', emoji: '🚨', descEN: 'Anti-raid protection.', descPT: 'Proteção anti-raid.' },
  { group: 'logs', dir: 'Logs', emoji: '📝', descEN: 'Logging configuration.', descPT: 'Configuração de logs.' },
  { group: 'levels', dir: 'Levels', emoji: '📈', descEN: 'Level and XP commands.', descPT: 'Comandos de níveis e XP.' },
  { group: 'welcome', dir: 'Welcome', emoji: '👋', descEN: 'Welcome and goodbye setup.', descPT: 'Configuração de boas-vindas e despedidas.' },
  { group: 'ticket', dir: 'Tickets', emoji: '🎫', descEN: 'Ticket system.', descPT: 'Sistema de tickets.' },
  { group: 'roles', dir: 'Roles', emoji: '🎭', descEN: 'Reaction and managed roles.', descPT: 'Cargos por reação e gerenciados.' },
  { group: 'giveaway', dir: 'Poll', emoji: '🎉', descEN: 'Giveaways and polls.', descPT: 'Sorteios e enquetes.' },
  { group: 'eco', dir: 'Economy', emoji: '💰', descEN: 'Economy commands.', descPT: 'Comandos de economia.' },
  { group: 'suggest', dir: 'Suggest', emoji: '💡', descEN: 'Suggestions.', descPT: 'Sugestões.' },
  { group: 'alerts', dir: 'Alerts', emoji: '🔔', descEN: 'External alerts (Twitch, YouTube...).', descPT: 'Alertas externos (Twitch, YouTube...).' },
  { group: 'tags', dir: 'Tags', emoji: '🏷️', descEN: 'Tags, reminders, AFK and highlights.', descPT: 'Tags, lembretes, AFK e destaques.', extraDirs: ['Remind'] },
  { group: 'utility', dir: 'Utility', emoji: '🧰', descEN: 'Utility tools.', descPT: 'Ferramentas utilitárias.', excludeFiles: ['slashcommand-ping.js'] },
  { group: 'fun', dir: 'Fun', emoji: '🎮', descEN: 'Fun commands.', descPT: 'Comandos divertidos.' },
  { group: 'info', dir: 'Information', emoji: 'ℹ️', descEN: 'Info and help.', descPT: 'Informações e ajuda.', members: [['Information', 'slashcommand-help.js'], ['Admin', 'slashcommand-language.js'], ['Utility', 'slashcommand-ping.js']] },
  { group: 'birthday', dir: 'Birthday', emoji: '🎂', descEN: 'Birthdays.', descPT: 'Aniversários.' },
  { group: 'counter', dir: 'Counter', emoji: '🔢', descEN: 'Member counters.', descPT: 'Contadores de membros.' },
  { group: 'embed', dir: 'Embed', emoji: '📦', descEN: 'Embed builder.', descPT: 'Criador de embeds.' },
  { group: 'voice', dir: 'Voice', emoji: '🔊', descEN: 'Temporary voice channels.', descPT: 'Canais de voz temporários.' },
  { group: 'sticky', dir: 'Sticky', emoji: '📌', descEN: 'Sticky messages.', descPT: 'Mensagens fixas.' },
];

function listSlash(dir) {
  return fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.js') && f.startsWith('slashcommand-')).sort();
}

function resolveMembers(g) {
  if (g.members) return g.members.map(([d, f]) => ({ dir: d, file: f }));
  if (g.split) {
    const files = listSlash(g.split.from).filter(f => !(g.split.exclude || []).includes(f));
    const slice = g.split.skip ? files.slice(g.split.skip) : files.slice(0, g.split.take);
    return slice.map(f => ({ dir: g.split.from, file: f }));
  }
  const dirs = [g.dir].concat(g.extraDirs || []);
  const out = [];
  for (const d of dirs) for (const f of listSlash(d)) {
    if ((g.excludeFiles || []).includes(f)) continue;
    out.push({ dir: d, file: f });
  }
  return out;
}

function headerLines(src) {
  const header = src.split('module.exports')[0];
  const raw = header.split('\n');
  const out = [];
  let buf = '';
  let bal = 0;
  for (const ln of raw) {
    buf += (buf ? '\n' : '') + ln;
    bal += (ln.match(/\(/g) || []).length - (ln.match(/\)/g) || []).length;
    bal += (ln.match(/\{/g) || []).length - (ln.match(/\}/g) || []).length;
    if (bal <= 0) { out.push(buf); buf = ''; bal = 0; }
  }
  if (buf) out.push(buf);
  return out;
}

// Merge a require line keeping only not-yet-seen vars. Returns line or null (drop).
function mergeRequire(line, seen) {
  line = line.replace(/\r/g, '');
  let m = line.match(/^\s*const\s+([A-Za-z_$][\w$]*)\s*=\s*require\((['"])(.+?)\2\)(.*)$/);
  if (m) {
    if (seen.has(m[1])) return null;
    seen.add(m[1]);
    return line.trim();
  }
  m = line.match(/^\s*const\s*\{([^}]*)\}\s*=\s*require\((['"])(.+?)\2\)(.*)$/);
  if (m) {
    const vars = m[1].split(',').map(s => s.trim()).filter(Boolean).filter(v => !seen.has(v.split(/\s*[:=]/)[0].trim()));
    if (!vars.length) return null;
    vars.forEach(v => seen.add(v.split(/\s*[:=]/)[0].trim()));
    return `const { ${vars.join(', ')} } = require(${m[2]}${m[3]}${m[2]})${m[4]}`.trim();
  }
  return 'UNPARSEABLE:' + line.trim();
}

const report = [];
const consumed = [];
const seenFiles = new Set();

for (const g of GROUPS) {
  const members = resolveMembers(g);
  if (members.length > 25) throw new Error(`Group ${g.group} has ${members.length} subcommands (>25)`);
  for (const { dir, file } of members) {
    const key = dir + '/' + file;
    if (seenFiles.has(key)) throw new Error(`DUPLICATE consumption: ${key}`);
    seenFiles.add(key);
  }
  const subs = [];
  const memberPerms = [];
  let maxCooldown = 0;
  const reqLines = [];
  const seen = new Set(['ChatInputCommandInteraction', 'DiscordBot', 'ApplicationCommand', 't', 'resolveLocale']);
  const handlers = [];

  for (const { dir, file } of members) {
    const full = path.join(ROOT, dir, file);
    delete require.cache[require.resolve(full)];
    const mod = require(full);
    if (mod.__type__ !== 1 || !mod.command || !mod.run) throw new Error(`Bad module ${dir}/${file}`);
    const c = mod.command;
    if (c.type !== 1) throw new Error(`Non chat-input ${dir}/${file}`);
    for (const [k, v] of Object.entries({ name: c.name, desc: c.description, descPT: c.description_localizations && c.description_localizations['pt-BR'] })) {
      if (typeof v === 'string' && v.length > 100) report.push(`LONG ${dir}/${file} ${k}=${v.length}`);
    }
    const sub = { name: c.name, description: c.description, type: 1, options: c.options || [] };
    if (c.name_localizations) sub.name_localizations = c.name_localizations;
    if (c.description_localizations) sub.description_localizations = c.description_localizations;
    subs.push(sub);
    memberPerms.push(c.default_member_permissions ? String(c.default_member_permissions) : null);
    const cd = mod.options && mod.options.cooldown;
    if (cd && cd > maxCooldown) maxCooldown = cd;

    const src = fs.readFileSync(full, 'utf8');
    for (const ln of headerLines(src)) {
      if (!ln.includes('require(')) continue;
      if (/require\(['"]\.\.\/\.\.\/structure\/ApplicationCommand['"]\)/.test(ln)) continue;
      const merged = mergeRequire(ln, seen);
      if (merged === null) continue;
      if (merged.startsWith('UNPARSEABLE:')) { report.push(`REQ ${dir}/${file}: ${merged}`); continue; }
      if (!reqLines.includes(merged)) reqLines.push(merged);
    }

    const fnSrc = mod.run.toString();
    if (!/^async\s*\(\s*client\s*,\s*interaction\s*\)\s*=>/.test(fnSrc)) report.push(`SIG ${dir}/${file}: ${fnSrc.slice(0, 60)}`);
    handlers.push({ name: c.name, fnSrc, perm: c.default_member_permissions ? String(c.default_member_permissions) : null });
    consumed.push(dir + '/' + file);
  }

  subs.sort((a, b) => a.name.localeCompare(b.name));
  handlers.sort((a, b) => a.name.localeCompare(b.name));

  // Top-level perm ONLY if every member requires the same one (else in-run checks only).
  let topPerm = null;
  if (memberPerms.length && memberPerms.every(p => p !== null && p === memberPerms[0])) topPerm = memberPerms[0];

  const outFile = `group-${g.group}.js`;
  const lines = [];
  lines.push(`// Grouped from ${members.length} flat commands (${members.map(m => m.dir + '/' + m.file).join(', ')}). Generated by scripts/group-commands.js.`);
  lines.push(`const { ChatInputCommandInteraction } = require('discord.js');`);
  lines.push(`const DiscordBot = require('../../client/DiscordBot');`);
  lines.push(`const ApplicationCommand = require('../../structure/ApplicationCommand');`);
  lines.push(`const { t, resolveLocale } = require('../../utils/i18n');`);
  for (const r of reqLines) lines.push(r);
  lines.push('');
  lines.push('const SUB_PERMS = {');
  for (const h of handlers) if (h.perm) lines.push(`    ${JSON.stringify(h.name)}: ${JSON.stringify(h.perm)},`);
  lines.push('};');
  lines.push('');
  lines.push('const handlers = {');
  for (const h of handlers) lines.push(`    ${JSON.stringify(h.name)}: ${h.fnSrc},`);
  lines.push('};');
  lines.push('');
  lines.push('module.exports = new ApplicationCommand({');
  lines.push('    command: {');
  lines.push(`        name: ${JSON.stringify(g.group)}, description: ${JSON.stringify(g.emoji + ' ' + g.descEN)}, type: 1,`);
  lines.push(`        description_localizations: { 'pt-BR': ${JSON.stringify(g.emoji + ' ' + g.descPT)} },`);
  if (topPerm) lines.push(`        default_member_permissions: ${JSON.stringify(topPerm)},`);
  lines.push('        options: [');
  for (const s of subs) {
    lines.push('            {');
    lines.push(`                name: ${JSON.stringify(s.name)},`);
    if (s.name_localizations) lines.push(`                name_localizations: ${JSON.stringify(s.name_localizations)},`);
    lines.push(`                description: ${JSON.stringify(s.description)},`);
    if (s.description_localizations) lines.push(`                description_localizations: ${JSON.stringify(s.description_localizations)},`);
    lines.push('                type: 1,');
    lines.push(`                options: ${JSON.stringify(s.options)},`);
    lines.push('            },');
  }
  lines.push('        ],');
  lines.push('    },');
  if (maxCooldown) lines.push(`    options: { cooldown: ${maxCooldown} },`);
  lines.push('    /**');
  lines.push('     * @param {DiscordBot} client');
  lines.push('     * @param {ChatInputCommandInteraction} interaction');
  lines.push('     */');
  lines.push('    run: async (client, interaction) => {');
  lines.push('        const sub = interaction.options.getSubcommand();');
  lines.push('        const need = SUB_PERMS[sub];');
  lines.push('        if (need) {');
  lines.push('            let ok = false;');
  lines.push('            try { ok = !!interaction.memberPermissions && interaction.memberPermissions.has(BigInt(need)); } catch { ok = false; }');
  lines.push('            if (!ok) {');
  lines.push('                const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });');
  lines.push(`                return interaction.reply({ content: t('handler.missing_permissions', { locale }), ephemeral: true });`);
  lines.push('            }');
  lines.push('        }');
  lines.push('        const fn = handlers[sub];');
  lines.push('        if (!fn) {');
  lines.push(`            return interaction.reply({ content: 'Unknown subcommand: ' + sub, ephemeral: true });`);
  lines.push('        }');
  lines.push('        return fn(client, interaction);');
  lines.push('    },');
  lines.push('}).toJSON();');
  lines.push('');
  fs.writeFileSync(path.join(ROOT, g.dir, outFile), lines.join('\n'));
  const openCount = memberPerms.filter(p => p === null).length;
  console.log(`group /${g.group} <- ${members.length} cmds (open=${openCount}, topPerm=${topPerm || 'none'}, cooldown=${maxCooldown || 'none'}) -> ${g.dir}/${outFile}`);
}

console.log('\nConsumed flat files:', consumed.length);
const allFlat = [];
for (const d of fs.readdirSync(ROOT)) for (const f of fs.readdirSync(path.join(ROOT, d)).filter(x => x.endsWith('.js') && x.startsWith('slashcommand-'))) allFlat.push(d + '/' + f);
const leftover = allFlat.filter(f => !consumed.includes(f));
console.log('Leftover (expect []):', JSON.stringify(leftover));
if (consumed.length !== allFlat.length) throw new Error('MISMATCH consumed vs flat total');
if (report.length) { console.log('\nAUDIT:'); for (const r of report) console.log(' ', r); }
else console.log('AUDIT: clean (no long strings, no odd signatures, no unparsed requires).');
