// Monta o modal completo de anúncio, com o jogo já preenchido (etapa 2/2).
const { ModalBuilder, LabelBuilder, TextInputBuilder, TextInputStyle, FileUploadBuilder } = require('discord.js');

function field(label, id, style, req, max, desc, ph, value) {
    const input = new TextInputBuilder().setCustomId(id).setStyle(style).setRequired(req).setMaxLength(max);
    if (ph) input.setPlaceholder(ph);
    if (value) input.setValue(String(value).slice(0, max));
    const lb = new LabelBuilder().setLabel(label).setTextInputComponent(input);
    if (desc) lb.setDescription(desc);
    return lb;
}

function buildAnuncioModal(game = '') {
    const modal = new ModalBuilder().setCustomId('anuncio-criar').setTitle('Criar anuncio');
    modal.addLabelComponents(
        field('Jogo', 'jogo', TextInputStyle.Short, true, 100, 'Confirmado na etapa 1', null, game),
        field('Titulo do anuncio', 'titulo', TextInputStyle.Short, true, 100, 'Ex: Conta upada full skins'),
        field('Preco em R$', 'preco', TextInputStyle.Short, true, 20, 'Só números, ex: 149,90', '149,90'),
        field('Descricao', 'descricao', TextInputStyle.Paragraph, true, 800, 'Rank, itens, etc'),
        new LabelBuilder()
            .setLabel('Foto da conta')
            .setDescription('Anexe 1 print (opcional)')
            .setFileUploadComponent(
                new FileUploadBuilder().setCustomId('imagem').setRequired(false).setMaxValues(1)
            ),
    );
    return modal;
}

function draftKey(guildId, userId) {
    return `addraft-${guildId}-${userId}`;
}

module.exports = { buildAnuncioModal, draftKey, field };
