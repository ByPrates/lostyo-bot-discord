// Catálogo de jogos da vitrine (`games-<guild>`). /anuncio criar usa em select.
const { ChatInputCommandInteraction } = require('discord.js');
const DiscordBot = require('../../client/DiscordBot');
const ApplicationCommand = require('../../structure/ApplicationCommand');
const { resolveLocale } = require('../../utils/i18n');
const { successEmbed, errorEmbed, infoEmbed } = require('../../utils/embeds');

const SUB_PERMS = {
    "adicionar": "8192",
    "remover": "8192",
};

function games(client, guildId) {
    return client.database.get('games-' + guildId) || [];
}

const handlers = {
    "adicionar": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const nome = interaction.options.getString('nome', true).trim().slice(0, 100);
        const all = games(client, interaction.guildId);
        if (all.some(g => g.toLowerCase() === nome.toLowerCase())) {
            return interaction.reply({ embeds: [infoEmbed(locale, `"${nome}" já está no catálogo.`)] });
        }
        if (all.length >= 25) return interaction.reply({ embeds: [errorEmbed(locale, 'Catálogo cheio (máx 25).')], ephemeral: true });
        all.push(nome);
        client.database.set('games-' + interaction.guildId, all);
        return interaction.reply({ embeds: [successEmbed(locale, `Jogo **${nome}** adicionado (${all.length}/25).`)] });
    },
    "remover": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const nome = interaction.options.getString('nome', true).trim();
        const all = games(client, interaction.guildId);
        const keep = all.filter(g => g.toLowerCase() !== nome.toLowerCase());
        if (keep.length === all.length) return interaction.reply({ embeds: [errorEmbed(locale, `"${nome}" não está no catálogo.` )], ephemeral: true });
        client.database.set('games-' + interaction.guildId, keep);
        return interaction.reply({ embeds: [successEmbed(locale, `Jogo **${nome}** removido.`)] });
    },
    "listar": async (client, interaction) => {
        const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
        const all = games(client, interaction.guildId);
        if (!all.length) return interaction.reply({ embeds: [infoEmbed(locale, 'Catálogo vazio. Staff: /jogos adicionar.')], ephemeral: true });
        return interaction.reply({ embeds: [infoEmbed(locale, all.map((g, i) => `${i + 1}. ${g}`).join('\n').slice(0, 3500))] });
    },
};

module.exports = new ApplicationCommand({
    command: {
        name: "jogos", description: "🎮 Catálogo de jogos da vitrine.", type: 1,
        description_localizations: { 'pt-BR': "🎮 Catálogo de jogos da vitrine." },
        options: [
            {
                name: "adicionar", description: "Adiciona jogo ao catálogo.",
                description_localizations: { "pt-BR": "Adiciona jogo ao catálogo." },
                type: 1,
                options: [{ name: "nome", description: "Game name", description_localizations: { "pt-BR": "Nome do jogo" }, type: 3, required: true }],
            },
            {
                name: "remover", description: "Remove jogo do catálogo.",
                description_localizations: { "pt-BR": "Remove jogo do catálogo." },
                type: 1,
                options: [{ name: "nome", description: "Game name", description_localizations: { "pt-BR": "Nome do jogo" }, type: 3, required: true }],
            },
            { name: "listar", description: "Lista jogos catalogados.", description_localizations: { "pt-BR": "Lista jogos catalogados." }, type: 1, options: [] },
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
                const locale = resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale });
                return interaction.reply({ content: 'Sem permissão (só staff).', ephemeral: true });
            }
        }
        const fn = handlers[sub];
        if (!fn) return interaction.reply({ content: 'Unknown subcommand: ' + sub, ephemeral: true });
        return fn(client, interaction);
    },
}).toJSON();
