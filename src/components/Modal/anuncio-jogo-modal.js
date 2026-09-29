const Component = require('../../structure/Component');
const { draftKey } = require('../../utils/anuncioForm');

let STATIC = [];
try { STATIC = require('../../data/games.json'); } catch { STATIC = []; }

module.exports = new Component({
    customId: 'anuncio-jogo', type: 'modal',
    run: async (client, interaction) => {
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
        const typed = String(interaction.fields.getTextInputValue('jogo') || '').trim();
        const custom = client.database.get('games-' + interaction.guildId) || [];
        const catalog = [...new Set([...custom, ...STATIC])];
        const t = typed.toLowerCase();
        const exact = catalog.find(g => g.toLowerCase() === t);
        const sug = catalog.filter(g => g.toLowerCase().includes(t)).slice(0, 25);

        if (exact) {
            client.database.set(draftKey(interaction.guildId, interaction.user.id), { game: exact });
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('anuncio-continue').setLabel('Continuar').setStyle(ButtonStyle.Primary).setEmoji('➡️')
            );
            return interaction.reply({ content: `Jogo: **${exact}**\nClique em Continuar para título, preço e foto.`, components: [row], ephemeral: true });
        }
        if (sug.length) {
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('anuncio-pick').setPlaceholder('Escolha o jogo')
                    .addOptions(sug.map(g => ({ label: g.slice(0, 100), value: g.slice(0, 100) })))
            );
            return interaction.reply({ content: `Encontrei ${sug.length} jogo(s) para **${typed}**. Escolha:`, components: [row], ephemeral: true });
        }
        return interaction.reply({ content: `Nenhum jogo para **${typed}**. Veja /jogos listar ou peça à staff (/jogos adicionar).`, ephemeral: true });
    },
}).toJSON();
