const Component = require('../../structure/Component');
const { draftKey } = require('../../utils/anuncioForm');

module.exports = new Component({
    customId: 'anuncio-pick', type: 'select',
    run: async (client, interaction) => {
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const game = interaction.values?.[0];
        if (!game) return interaction.reply({ content: 'Escolha um jogo.', ephemeral: true });
        client.database.set(draftKey(interaction.guildId, interaction.user.id), { game });
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('anuncio-continue').setLabel('Continuar').setStyle(ButtonStyle.Primary).setEmoji('➡️')
        );
        return interaction.update({ content: `Jogo: **${game}**\nClique em Continuar para título, preço e foto.`, components: [row] });
    },
}).toJSON();
