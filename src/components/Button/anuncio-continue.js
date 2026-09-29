const Component = require('../../structure/Component');
const { buildAnuncioModal, draftKey } = require('../../utils/anuncioForm');

module.exports = new Component({
    customId: 'anuncio-continue', type: 'button',
    run: async (client, interaction) => {
        const draft = client.database.get(draftKey(interaction.guildId, interaction.user.id));
        if (!draft?.game) {
            return interaction.reply({ content: 'Sessão expirada. Recomece pelo botão Criar anúncio.', ephemeral: true });
        }
        return interaction.showModal(buildAnuncioModal(draft.game));
    },
}).toJSON();
