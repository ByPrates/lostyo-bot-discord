const Component = require('../../structure/Component');

module.exports = new Component({
    customId: 'ticket-open', type: 'button',
    run: async (client, interaction) => {
        const { ModalBuilder, LabelBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
        const modal = new ModalBuilder().setCustomId('ticket-abrir').setTitle('Abrir ticket');
        modal.addLabelComponents(
            new LabelBuilder()
                .setLabel('ID do anuncio (ex: 7)')
                .setDescription('Numero # do anuncio na vitrine')
                .setTextInputComponent(
                    new TextInputBuilder().setCustomId('anuncio').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(10)
                ),
            new LabelBuilder()
                .setLabel('Proposta / observacao')
                .setTextInputComponent(
                    new TextInputBuilder().setCustomId('proposta').setStyle(TextInputStyle.Paragraph).setRequired(false).setMaxLength(500)
                ),
        );
        return interaction.showModal(modal);
    },
}).toJSON();
