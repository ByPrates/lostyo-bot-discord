// Envia os 4 padrões de mensagem no canal de preview e encerra.
// Uso: node scripts/preview-patterns.js [locale]
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, warningEmbed } = require('../src/utils/embeds');

const CHANNEL_ID = '1388811771099222028';
const locale = process.argv[2] || 'en-US';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('clientReady', async () => {
    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        console.log('Canal:', channel.name, '| Servidor:', channel.guild?.name);

        await channel.send({
            embeds: [successEmbed(locale, '**User#1234** banned for **spam**.')],
        });

        await channel.send({
            embeds: [errorEmbed(locale, 'Member not found.')],
        });

        await channel.send({
            embeds: [infoEmbed(locale, '**42** members · **12** channels · **8** roles')],
        });

        await channel.send({
            embeds: [warningEmbed(locale, 'This will delete **50** messages. This cannot be undone.')],
        });

        console.log('4 padrões enviados.');
    } catch (err) {
        console.error('Falha:', err.message);
        process.exitCode = 1;
    } finally {
        await client.destroy();
    }
});

client.login(process.env.CLIENT_TOKEN);
