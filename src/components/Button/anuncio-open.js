const Component = require('../../structure/Component');

module.exports = new Component({
    customId: 'anuncio-open', type: 'button',
    run: async (client, interaction) => {
        const { ModalBuilder, LabelBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
        const modal = new ModalBuilder().setCustomId('anuncio-jogo').setTitle('Criar anuncio 1/2');
        modal.addLabelComponents(
            new LabelBuilder()
                .setLabel('Jogo')
                .setDescription('Digite parte do nome (ex: free, roblox)')
                .setTextInputComponent(
                    new TextInputBuilder().setCustomId('jogo').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100)
                ),
        );
        return interaction.showModal(modal);
    },
}).toJSON();
