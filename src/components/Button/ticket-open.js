const Component = require('../../structure/Component');

module.exports = new Component({
    customId: 'ticket-open', type: 'button',
    run: async (client, interaction) => {
        const { ChannelType, PermissionFlagsBits } = require('discord.js');
        const name = 'ticket-' + interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
        try {
            const ch = await interaction.guild.channels.create({
                name, type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                ],
            });
            const d = client.database.get('tickets-' + interaction.guildId) || {};
            d[ch.id] = 'open';
            client.database.set('tickets-' + interaction.guildId, d);
            await ch.send('Ticket for <@' + interaction.user.id + '>.');
            return interaction.reply({ content: 'Created: ' + ch.toString(), ephemeral: true });
        } catch (e) { return interaction.reply({ content: 'Error: ' + (e.message || e), ephemeral: true }); }
    },
}).toJSON();
