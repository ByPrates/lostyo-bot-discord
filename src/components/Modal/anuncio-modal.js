const Component = require('../../structure/Component');

const fmt = (v) => 'R$' + Number(v).toFixed(2).replace('.', ',');

let STATIC = [];
try { STATIC = require('../../data/games.json'); } catch { STATIC = []; }

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

function matchGame(all, typed) {
    const t = String(typed || '').trim().toLowerCase();
    if (!t) return { game: null, sug: [] };
    const exact = all.find(g => g.toLowerCase() === t);
    if (exact) return { game: exact, sug: [] };
    const starts = all.filter(g => g.toLowerCase().startsWith(t)).slice(0, 8);
    const has = all.filter(g => !g.toLowerCase().startsWith(t) && g.toLowerCase().includes(t)).slice(0, 8);
    return { game: null, sug: [...starts, ...has].slice(0, 8) };
}

module.exports = new Component({
    customId: 'anuncio-criar', type: 'modal',
    run: async (client, interaction) => {
        const guildId = interaction.guildId;
        const sellers = client.database.get('sellers-' + guildId) || [];
        const isSeller = sellers.some(s => s.userId === interaction.user.id);
        let staff = false;
        try { staff = !!interaction.memberPermissions?.has(8192n); } catch { staff = false; }
        if (!isSeller && !staff) {
            return interaction.reply({ content: 'Só vende quem tem CPF cadastrado. Fale com a staff.', ephemeral: true });
        }
        const custom = client.database.get('games-' + guildId) || [];
        const catalog = [...new Set([...custom, ...STATIC])];
        const { game, sug } = matchGame(catalog, interaction.fields.getTextInputValue('jogo'));
        if (!game) {
            return interaction.reply({
                content: 'Jogo não encontrado. Confira em /jogos listar.' + (sug.length ? '\nQuis dizer: ' + sug.join(' · ') : ''),
                ephemeral: true,
            });
        }
        const titulo = interaction.fields.getTextInputValue('titulo').slice(0, 100);
        const preco = parsePreco(interaction.fields.getTextInputValue('preco'));
        const descricao = interaction.fields.getTextInputValue('descricao').slice(0, 800);
        const uploads = interaction.fields.getUploadedFiles('imagem') || [];
        const file = uploads.find(a => (a.contentType || '').startsWith('image/') && (a.size || 0) <= 10 * 1024 * 1024) || null;
        if (preco === null) return interaction.reply({ content: 'Preço inválido: use só números, ponto ou vírgula. Ex: 149,90', ephemeral: true });

        await interaction.deferReply({ ephemeral: true });
        try {
            const seq = Number(client.database.get('adseq-' + guildId) || 0) + 1;
            const vitrine = interaction.guild.channels.cache.find(c => c.name === '📸┃divulgar-contas' && c.isTextBased());
            if (!vitrine) return interaction.editReply({ content: 'Canal de vitrine não encontrado.' });
            const fee = preco > 250 ? 19.70 : 9.70;
            const { ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MessageFlags } = require('discord.js');
            const card = new ContainerBuilder().setAccentColor(0xffffff).addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `# #${seq} — ${titulo}\n` +
                    `**Jogo:** ${game}\n` +
                    `**Preço:** ${fmt(preco)} + taxa ${fmt(fee)} (comprador paga ${fmt(preco + fee)})\n` +
                    `**Vendedor:** <@${interaction.user.id}>\n\n${descricao}`
                ),
                new TextDisplayBuilder().setContent(`👉 Para comprar: abra ticket em <#1554279618222100550> e informe o ID **#${seq}**`),
            );
            if (file) card.addMediaGalleryComponents(new MediaGalleryBuilder().addItems({ media: { url: file.url } }));
            const msg = await vitrine.send({ flags: MessageFlags.IsComponentsV2, components: [card] });

            client.database.set('adseq-' + guildId, seq);
            const all = client.database.get('ads-' + guildId) || [];
            all.push({ id: seq, messageId: msg.id, channelId: msg.channelId, sellerId: interaction.user.id, jogo: game, titulo, preco, descricao, img: file?.url || null, status: 'ativo', ts: Date.now() });
            client.database.set('ads-' + guildId, all);
            try { client.database.delete(`addraft-${guildId}-${interaction.user.id}`); } catch {}
            return interaction.editReply({ content: `Anúncio **#${seq}** publicado: ${msg.url}` });
        } catch (e) {
            return interaction.editReply({ content: 'Erro ao publicar: ' + (e.message || e) });
        }
    },
}).toJSON();
