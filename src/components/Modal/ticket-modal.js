const Component = require('../../structure/Component');

function ads(client, guildId) {
    return client.database.get('ads-' + guildId) || [];
}

module.exports = new Component({
    customId: 'ticket-abrir', type: 'modal',
    run: async (client, interaction) => {
        const { ChannelType, PermissionFlagsBits } = require('discord.js');
        const guild = interaction.guild;
        const adId = Number((interaction.fields.getTextInputValue('anuncio') || '').trim());
        const proposta = (interaction.fields.getTextInputValue('proposta') || '').slice(0, 500);
        const ad = Number.isFinite(adId) ? ads(client, guild.id).find(a => a.id === adId && a.status === 'ativo') : null;

        await interaction.deferReply({ ephemeral: true });
        try {
            const cats = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory);
            const tickets = cats.find(c => c.name === 'TICKETS') || null;
            const staff = guild.roles.cache.find(r => r.name === 'Staff');
            const inter = guild.roles.cache.find(r => r.name === 'Intermediador');
            const founder = guild.roles.cache.find(r => r.name === 'Founder');
            const overwrites = [
                { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            ];
            for (const r of [staff, inter, founder]) {
                if (r) overwrites.push({ id: r.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
            }
            const name = 'ticket-' + interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
            const ch = await guild.channels.create({ name, type: ChannelType.GuildText, parent: tickets?.id || null, permissionOverwrites: overwrites });

            const d = client.database.get('tickets-' + guild.id) || {};
            d[ch.id] = 'open';
            client.database.set('tickets-' + guild.id, d);

            const adLine = ad
                ? `**Anúncio #${ad.id}** — ${ad.titulo} (${ad.jogo}) — R$${Number(ad.preco).toFixed(2).replace('.', ',')} — vendedor <@${ad.sellerId}>`
                : `Anúncio informado: **${interaction.fields.getTextInputValue('anuncio').slice(0, 50)}** (não localizado — staff confere)`;
            const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
            const { e } = require('../../utils/emojis');
            const card = new ContainerBuilder().setAccentColor(0xffffff).addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${e('ticket')} Ticket de compra\n${adLine}\n**Proposta:** ${proposta || '-'}`),
                new TextDisplayBuilder().setContent(`Staff: confira o anúncio e rode \`/escrow criar\`.`),
            );
            await ch.send({
                content: `${inter ? `<@&${inter.id}> ` : ''}Novo ticket de <@${interaction.user.id}>`,
                flags: MessageFlags.IsComponentsV2,
                components: [card],
            });
            return interaction.editReply({ content: 'Ticket criado: ' + ch.toString() });
        } catch (e) {
            return interaction.editReply({ content: 'Erro ao criar ticket: ' + (e.message || e) });
        }
    },
}).toJSON();
