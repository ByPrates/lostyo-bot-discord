// Escrow de contas (modo marketplace): vendedor manda a conta ao intermediador,
// comprador manda o dinheiro, intermediador faz a troca. Estado em `escrow-<guild>`.
// Taxa fixa: R$9,70 (preço até R$250) | R$19,70 (acima de R$250), paga pelo comprador.
// Só vende quem tem CNPJ cadastrado (`sellers-<guild>`).
const { ChatInputCommandInteraction } = require('discord.js');
const DiscordBot = require('../../client/DiscordBot');
const ApplicationCommand = require('../../structure/ApplicationCommand');
const { resolveLocale } = require('../../utils/i18n');
const { successEmbed, errorEmbed, infoEmbed } = require('../../utils/embeds');

const SUB_PERMS = {
    "cadastrar": "8192", // ManageMessages — intermediador/staff
    "conta-recebida": "8192",
    "pagamento-recebido": "8192",
    "concluir": "8192",
    "cancelar": "8192",
};

const fmt = (v) => 'R$' + Number(v).toFixed(2).replace('.', ',');
const feeFor = (preco) => (Number(preco) > 250 ? 19.70 : 9.70);

function loadAll(client, guildId) {
    return client.database.get('escrow-' + guildId) || [];
}
function saveAll(client, guildId, arr) {
    client.database.set('escrow-' + guildId, arr);
}
function current(client, guildId, channelId) {
    return loadAll(client, guildId).find(e => e.channelId === channelId && e.status !== 'concluida' && e.status !== 'cancelada');
}
function sellers(client, guildId) {
    return client.database.get('sellers-' + guildId) || [];
}
function findSeller(client, guildId, userId) {
    return sellers(client, guildId).find(s => s.userId === userId);
}

const handlers = {
    "criar": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const vendedor = interaction.options.getUser('vendedor', true);
        const comprador = interaction.options.getUser('comprador', true);
        const preco = interaction.options.getNumber('preco', true);
        const descricaoOpt = interaction.options.getString('descricao');
        const adOpt = interaction.options.getInteger('anuncio');
        if (!(preco > 0)) return interaction.reply({ embeds: [errorEmbed(locale, 'Preço inválido.')], ephemeral: true });
        let descricao = descricaoOpt || 'Conta de jogo';
        if (adOpt) {
            const ads = client.database.get('ads-' + interaction.guildId) || [];
            const ad = ads.find(a => a.id === adOpt && a.status === 'ativo');
            if (!ad) return interaction.reply({ embeds: [errorEmbed(locale, `Anúncio #${adOpt} não encontrado/ativo.` )], ephemeral: true });
            if (ad.sellerId !== vendedor.id) {
                return interaction.reply({ embeds: [errorEmbed(locale, `Anúncio #${adOpt} é de outro vendedor (<@${ad.sellerId}>).`)], ephemeral: true });
            }
            if (!descricaoOpt) descricao = `#${ad.id} — ${ad.titulo} (${ad.jogo})`;
        }
        if (!findSeller(client, interaction.guildId, vendedor.id)) {
            return interaction.reply({ embeds: [errorEmbed(locale, `Vendedor <@${vendedor.id}> **sem CNPJ cadastrado**. Staff: /escrow cadastrar vendedor:@ cnpj:00.000.000/0001-00`)], ephemeral: true });
        }
        if (current(client, interaction.guildId, interaction.channelId)) {
            return interaction.reply({ embeds: [errorEmbed(locale, 'Já existe um escrow aberto neste ticket. Use /escrow status.')], ephemeral: true });
        }
        const fee = feeFor(preco);
        const all = loadAll(client, interaction.guildId);
        all.push({
            channelId: interaction.channelId,
            vendedorId: vendedor.id, compradorId: comprador.id,
            preco, fee,
            descricao: String(descricao).slice(0, 300),
            accountOk: false, payOk: false,
            status: 'aberta', ts: Date.now(), by: interaction.user.id,
        });
        saveAll(client, interaction.guildId, all);
        return interaction.reply({
            embeds: [successEmbed(locale,
                `**Escrow criado**\n` +
                `Vendedor: <@${vendedor.id}> (CNPJ ✅)\nComprador: <@${comprador.id}>\n` +
                `Preço: **${fmt(preco)}** + taxa **${fmt(fee)}** = total comprador **${fmt(preco + fee)}**\n` +
                `Item: ${descricao}\n\n` +
                `1. Vendedor envia login+senha+e-mail ao intermediador\n` +
                `2. Intermediador: /escrow conta-recebida\n` +
                `3. Comprador paga **${fmt(preco + fee)}** e manda comprovante\n` +
                `4. Intermediador: /escrow pagamento-recebido\n` +
                `5. Troca feita → comprador tem 24h p/ confirmar → /escrow concluir`
            )],
        });
    },
    "cadastrar": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const vendedor = interaction.options.getUser('vendedor', true);
        const raw = interaction.options.getString('cnpj', true);
        const digits = raw.replace(/\D/g, '');
        if (digits.length !== 14) return interaction.reply({ embeds: [errorEmbed(locale, 'CNPJ inválido. Use 14 dígitos.')], ephemeral: true });
        const all = sellers(client, interaction.guildId);
        const i = all.findIndex(s => s.userId === vendedor.id);
        const rec = { userId: vendedor.id, cnpj: digits, by: interaction.user.id, ts: Date.now() };
        if (i >= 0) all[i] = rec; else all.push(rec);
        client.database.set('sellers-' + interaction.guildId, all);
        return interaction.reply({ embeds: [successEmbed(locale, `Vendedor <@${vendedor.id}> cadastrado (CNPJ ****${digits.slice(-4)}).`) ] });
    },
    "vendedores": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const all = sellers(client, interaction.guildId);
        if (!all.length) return interaction.reply({ embeds: [infoEmbed(locale, 'Nenhum vendedor cadastrado.')], ephemeral: true });
        return interaction.reply({ embeds: [infoEmbed(locale, all.map(s => `<@${s.userId}> — CNPJ ****${s.cnpj.slice(-4)}`).join('\n').slice(0, 3500))] });
    },
    "tabela": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        return interaction.reply({ embeds: [infoEmbed(locale, `**Taxa do intermédio (paga pelo comprador)**\nAté ${fmt(250)}: **${fmt(9.70)}**\nAcima de ${fmt(250)}: **${fmt(19.70)}**`)] });
    },
    "status": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const e = current(client, interaction.guildId, interaction.channelId);
        if (!e) return interaction.reply({ embeds: [infoEmbed(locale, 'Sem escrow aberto neste canal.')], ephemeral: true });
        return interaction.reply({
            embeds: [infoEmbed(locale,
                `**Status: ${e.status}**\nVendedor: <@${e.vendedorId}> ${e.accountOk ? '✅ conta recebida' : '⏳ conta pendente'}\n` +
                `Comprador: <@${e.compradorId}> ${e.payOk ? '✅ pagamento recebido' : '⏳ pagamento pendente'}\n` +
                `Preço: ${fmt(e.preco)} + taxa ${fmt(e.fee)} = ${fmt(Number(e.preco) + Number(e.fee))}\nItem: ${e.descricao || '-'}`
            )],
        });
    },
    "conta-recebida": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const all = loadAll(client, interaction.guildId);
        const e = all.find(x => x.channelId === interaction.channelId && x.status !== 'concluida' && x.status !== 'cancelada');
        if (!e) return interaction.reply({ embeds: [errorEmbed(locale, 'Sem escrow aberto aqui.')], ephemeral: true });
        e.accountOk = true;
        if (e.status === 'aberta') e.status = 'conta-ok';
        saveAll(client, interaction.guildId, all);
        return interaction.reply({ embeds: [successEmbed(locale, `Conta de <@${e.vendedorId}> **testada e recebida**. Aguardando pagamento de <@${e.compradorId}> (${fmt(Number(e.preco) + Number(e.fee))}).`)] });
    },
    "pagamento-recebido": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const all = loadAll(client, interaction.guildId);
        const e = all.find(x => x.channelId === interaction.channelId && x.status !== 'concluida' && x.status !== 'cancelada');
        if (!e) return interaction.reply({ embeds: [errorEmbed(locale, 'Sem escrow aberto aqui.')], ephemeral: true });
        e.payOk = true;
        e.status = 'pagamento-ok';
        saveAll(client, interaction.guildId, all);
        return interaction.reply({ embeds: [successEmbed(locale, `Pagamento de <@${e.compradorId}> **confirmado** (${fmt(Number(e.preco) + Number(e.fee))}). ${e.accountOk ? 'Pronto para trocar: faça a entrega e aguarde a confirmação em 24h, depois /escrow concluir.' : 'Aguardando conta do vendedor.'}`)] });
    },
    "concluir": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const all = loadAll(client, interaction.guildId);
        const e = all.find(x => x.channelId === interaction.channelId && x.status !== 'concluida' && x.status !== 'cancelada');
        if (!e) return interaction.reply({ embeds: [errorEmbed(locale, 'Sem escrow aberto aqui.')], ephemeral: true });
        if (!e.accountOk || !e.payOk) {
            return interaction.reply({ embeds: [errorEmbed(locale, `Falta: ${!e.accountOk ? 'conta' : ''}${!e.accountOk && !e.payOk ? ' + ' : ''}${!e.payOk ? 'pagamento' : ''}.`)], ephemeral: true });
        }
        e.status = 'concluida';
        e.doneTs = Date.now();
        saveAll(client, interaction.guildId, all);
        try { await interaction.channel.setName('entregue-' + interaction.channel.name.slice(0, 60)); } catch {}
        return interaction.reply({
            embeds: [successEmbed(locale,
                `**Troca concluída** ✅\nVendedor <@${e.vendedorId}> recebe **${fmt(e.preco)}** após confirmação do comprador (até 24h). Taxa da casa: **${fmt(e.fee)}**.\n` +
                `Garantia de 24h contra recuperação. Depois: /ticket transcript + /ticket close. Apague credenciais do chat.`
            )],
        });
    },
    "cancelar": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const motivo = interaction.options.getString('motivo') || 'Sem motivo';
        const all = loadAll(client, interaction.guildId);
        const e = all.find(x => x.channelId === interaction.channelId && x.status !== 'concluida' && x.status !== 'cancelada');
        if (!e) return interaction.reply({ embeds: [errorEmbed(locale, 'Sem escrow aberto aqui.')], ephemeral: true });
        e.status = 'cancelada';
        e.motivo = String(motivo).slice(0, 300);
        saveAll(client, interaction.guildId, all);
        return interaction.reply({ embeds: [infoEmbed(locale, `Escrow **cancelado**. Motivo: ${e.motivo}\nDevolva conta e valores como estavam.`)] });
    },
};

module.exports = new ApplicationCommand({
    command: {
        name: "escrow", description: "🤝 Intermédio de contas com taxa fixa.", type: 1,
        description_localizations: { 'pt-BR': "🤝 Intermédio de contas com taxa fixa." },
        options: [
            {
                name: "criar", description: "Cria escrow no ticket atual.",
                description_localizations: { "pt-BR": "Cria escrow no ticket atual." },
                type: 1,
                options: [
                    { name: "vendedor", description: "Seller (precisa CNPJ)", description_localizations: { "pt-BR": "Vendedor (precisa CNPJ)" }, type: 6, required: true },
                    { name: "comprador", description: "Buyer", description_localizations: { "pt-BR": "Comprador" }, type: 6, required: true },
                    { name: "preco", description: "Price in R$", description_localizations: { "pt-BR": "Preço em R$" }, type: 10, required: true },
                    { name: "descricao", description: "Item description", description_localizations: { "pt-BR": "Descrição do item" }, type: 3 },
                    { name: "anuncio", description: "Ad ID (ex: 7)", description_localizations: { "pt-BR": "ID do anúncio (ex: 7)" }, type: 4 },
                ],
            },
            {
                name: "cadastrar", description: "Cadastra vendedor com CNPJ.",
                description_localizations: { "pt-BR": "Cadastra vendedor com CNPJ." },
                type: 1,
                options: [
                    { name: "vendedor", description: "Seller", description_localizations: { "pt-BR": "Vendedor" }, type: 6, required: true },
                    { name: "cnpj", description: "CNPJ (14 digitos)", description_localizations: { "pt-BR": "CNPJ (14 dígitos)" }, type: 3, required: true },
                ],
            },
            { name: "vendedores", description: "Lista vendedores cadastrados.", description_localizations: { "pt-BR": "Lista vendedores cadastrados." }, type: 1, options: [] },
            { name: "tabela", description: "Mostra tabela de taxas.", description_localizations: { "pt-BR": "Mostra tabela de taxas." }, type: 1, options: [] },
            { name: "status", description: "Mostra escrow do canal.", description_localizations: { "pt-BR": "Mostra escrow do canal." }, type: 1, options: [] },
            { name: "conta-recebida", description: "Intermediador confirma conta testada.", description_localizations: { "pt-BR": "Intermediador confirma conta testada." }, type: 1, options: [] },
            { name: "pagamento-recebido", description: "Intermediador confirma pagamento.", description_localizations: { "pt-BR": "Intermediador confirma pagamento." }, type: 1, options: [] },
            { name: "concluir", description: "Conclui a troca (exige conta+pagamento).", description_localizations: { "pt-BR": "Conclui a troca (exige conta+pagamento)." }, type: 1, options: [] },
            {
                name: "cancelar", description: "Cancela o escrow.",
                description_localizations: { "pt-BR": "Cancela o escrow." },
                type: 1,
                options: [{ name: "motivo", description: "Reason", description_localizations: { "pt-BR": "Motivo" }, type: 3 }],
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
                return interaction.reply({ content: 'Sem permissão para isso (só intermediador/staff).', ephemeral: true });
            }
        }
        const fn = handlers[sub];
        if (!fn) return interaction.reply({ content: 'Unknown subcommand: ' + sub, ephemeral: true });
        return fn(client, interaction);
    },
}).toJSON();
