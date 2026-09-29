// Vitrine automática: vendedor usa /anuncio criar e o bot publica.
// Membros não postam na vitrine (canal travado, só leitura).
// Jogo com autocomplete sobre lista fixa (src/data/games.json) + /jogos.
const { ChatInputCommandInteraction } = require('discord.js');
const DiscordBot = require('../../client/DiscordBot');
const ApplicationCommand = require('../../structure/ApplicationCommand');
const { resolveLocale } = require('../../utils/i18n');
const { successEmbed, errorEmbed, infoEmbed } = require('../../utils/embeds');

const SUB_PERMS = {
    "remover": "8192",
};

const fmt = (v) => 'R$' + Number(v).toFixed(2).replace('.', ',');

// Só números, ponto e vírgula. Normaliza BR/US.
function parsePreco(raw) {
    let s = String(raw || '').trim().replace(/^(R\$|\$)\s*/i, '').replace(/\s+/g, '');
    if (!/^(?=.*\d)[\d.,]+$/.test(s)) return null;
    if (s.includes('.') && s.includes(',')) {
        s = s.replace(/\./g, '').replace(',', '.');
    } else if (s.includes(',')) {
        s = s.replace(',', '.');
    } else if ((s.match(/\./g) || []).length > 1) {
        const parts = s.split('.');
        const last = parts.pop();
        s = last.length <= 2 ? parts.join('') + '.' + last : parts.join('') + last;
    }
    const v = Number(s);
    return Number.isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null;
}

function ads(client, guildId) {
    return client.database.get('ads-' + guildId) || [];
}

const handlers = {
    "criar": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const sellers = client.database.get('sellers-' + interaction.guildId) || [];
        const isSeller = sellers.some(s => s.userId === interaction.user.id);
        let staff = false;
        try { staff = !!interaction.memberPermissions?.has(8192n); } catch { staff = false; }
        if (!isSeller && !staff) {
            return interaction.reply({ content: 'Só vende quem tem CPF cadastrado. Fale com a staff.', ephemeral: true });
        }
        const jogo = (interaction.options.getString('jogo', true) || '').slice(0, 100);
        const titulo = (interaction.options.getString('titulo', true) || '').slice(0, 100);
        const preco = parsePreco(interaction.options.getString('preco', true));
        const descricao = (interaction.options.getString('descricao', true) || '').slice(0, 800);
        const imagem = interaction.options.getAttachment('imagem');
        if (preco === null) return interaction.reply({ content: 'Preço inválido: use só números, ponto ou vírgula. Ex: 149,90', ephemeral: true });
        if (imagem && !((imagem.contentType || '').startsWith('image/') && (imagem.size || 0) <= 10 * 1024 * 1024)) {
            return interaction.reply({ content: 'Imagem inválida (máx 10MB).', ephemeral: true });
        }
        await interaction.deferReply({ ephemeral: true });
        try {
            const seq = Number(client.database.get('adseq-' + interaction.guildId) || 0) + 1;
            const vitrine = interaction.guild.channels.cache.find(c => c.name === '📸┃divulgar-contas' && c.isTextBased());
            if (!vitrine) return interaction.editReply({ content: 'Canal de vitrine não encontrado.' });
            const fee = preco > 250 ? 19.70 : 9.70;
            const { ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MessageFlags } = require('discord.js');
            const card = new ContainerBuilder().setAccentColor(0xffffff).addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `# #${seq} — ${titulo}\n` +
                    `**Jogo:** ${jogo}\n` +
                    `**Preço:** ${fmt(preco)} + taxa ${fmt(fee)} (comprador paga ${fmt(preco + fee)})\n` +
                    `**Vendedor:** <@${interaction.user.id}>\n\n${descricao}`
                ),
                new TextDisplayBuilder().setContent(`👉 Para comprar: abra ticket em <#1554279618222100550> e informe o ID **#${seq}**`),
            );
            if (imagem) card.addMediaGalleryComponents(new MediaGalleryBuilder().addItems({ media: { url: imagem.url } }));
            const msg = await vitrine.send({ flags: MessageFlags.IsComponentsV2, components: [card] });

            client.database.set('adseq-' + interaction.guildId, seq);
            const all = ads(client, interaction.guildId);
            all.push({ id: seq, messageId: msg.id, channelId: msg.channelId, sellerId: interaction.user.id, jogo, titulo, preco, descricao, img: imagem?.url || null, status: 'ativo', ts: Date.now() });
            client.database.set('ads-' + interaction.guildId, all);
            return interaction.editReply({ content: `Anúncio **#${seq}** publicado: ${msg.url}` });
        } catch (e) {
            return interaction.editReply({ content: 'Erro ao publicar: ' + (e.message || e) });
        }
    },
    "meus": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const mine = ads(client, interaction.guildId).filter(a => a.sellerId === interaction.user.id && a.status === 'ativo');
        if (!mine.length) return interaction.reply({ embeds: [infoEmbed(locale, 'Você não tem anúncios ativos.')], ephemeral: true });
        return interaction.reply({
            embeds: [infoEmbed(locale, mine.map(a => `**#${a.id}** — ${a.titulo} (${a.jogo}) — R$${Number(a.preco).toFixed(2).replace('.', ',')}`).join('\n').slice(0, 3500))],
            ephemeral: true,
        });
    },
    "remover": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const id = interaction.options.getInteger('id', true);
        const all = ads(client, interaction.guildId);
        const a = all.find(x => x.id === id && x.status === 'ativo');
        if (!a) return interaction.reply({ embeds: [errorEmbed(locale, 'Anúncio não encontrado.')], ephemeral: true });
        a.status = 'removido';
        client.database.set('ads-' + interaction.guildId, all);
        try {
            const ch = await client.channels.fetch(a.channelId).catch(() => null);
            const msg = await ch?.messages.fetch(a.messageId).catch(() => null);
            await msg?.delete().catch(() => null);
        } catch {}
        return interaction.reply({ embeds: [successEmbed(locale, `Anúncio **#${id}** removido.`)] });
    },
};

module.exports = new ApplicationCommand({
    command: {
        name: "anuncio", description: "📸 Anúncios da vitrine.", type: 1,
        description_localizations: { 'pt-BR': "📸 Anúncios da vitrine." },
        options: [
            {
                name: "criar", description: "Cria anúncio na vitrine.",
                description_localizations: { "pt-BR": "Cria anúncio na vitrine." },
                type: 1,
                options: [
                    { name: "jogo", description: "Digite para buscar o jogo", description_localizations: { "pt-BR": "Digite para buscar o jogo" }, type: 3, required: true, autocomplete: true },
                    { name: "titulo", description: "Ad title", description_localizations: { "pt-BR": "Título do anúncio" }, type: 3, required: true },
                    { name: "preco", description: "Price (ex: 149,90)", description_localizations: { "pt-BR": "Preço (ex: 149,90)" }, type: 3, required: true },
                    { name: "descricao", description: "Rank, itens, etc", description_localizations: { "pt-BR": "Descrição: rank, itens, etc" }, type: 3, required: true },
                    { name: "imagem", description: "Print da conta (opcional)", description_localizations: { "pt-BR": "Print da conta (opcional)" }, type: 11, required: false },
                ],
            },
            { name: "meus", description: "Seus anúncios ativos.", description_localizations: { "pt-BR": "Seus anúncios ativos." }, type: 1, options: [] },
            {
                name: "remover", description: "Remove anúncio por ID.",
                description_localizations: { "pt-BR": "Remove anúncio por ID." },
                type: 1,
                options: [{ name: "id", description: "Ad ID", description_localizations: { "pt-BR": "ID do anúncio" }, type: 4, required: true }],
            },
        ],
    },
    /**
     * @param {DiscordBot} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const sub = interaction.options.getSubcommand();
        const need = SUB_PERMS[sub];
        if (need) {
            let ok = false;
            try { ok = !!interaction.memberPermissions && interaction.memberPermissions.has(BigInt(need)); } catch { ok = false; }
            if (!ok) {
                return interaction.reply({ content: 'Sem permissão (só staff).', ephemeral: true });
            }
        }
        const fn = handlers[sub];
        if (!fn) return interaction.reply({ content: 'Unknown subcommand: ' + sub, ephemeral: true });
        return fn(client, interaction);
    },
}).toJSON();
