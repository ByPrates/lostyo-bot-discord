// Copie para config.js no painel do Bot-Hosting.net (mesma pasta src/).
// Nenhum token aqui — token vai em Variáveis (.env -> CLIENT_TOKEN).
const config = {
    database: {
        path: './data/database.yml'
    },
    development: {
        // Bot público: deixe enabled=true e coloque o ID do servidor de staff/suporte.
        // Comandos slash atualizam na hora só lá. Quando for lançar, mude para false (global, demora até 1h).
        enabled: true,
        guildId: '1388811770273075220',
    },
    commands: {
        prefix: '!', // Unused while message_commands is false (kept for optional re-enable).
        message_commands: false, // Prefix commands disabled — slash only.
        application_commands: {
            chat_input: true,
            user_context: true,
            message_context: true
        }
    },
    users: {
        ownerId: '1186245792353243180',
        developers: ['1186245792353243180']
    },
    i18n: {
        defaultLocale: 'en-US', // Default/fallback language.
        supportedLocales: ['pt-BR', 'en-US'], // New languages = new files in src/locales/.
    },
    // Módulos desligados no modo marketplace (escrow). Handler pula estes arquivos.
    // Manter = mod, modtools, antiraid, automod, logs, roles, ticket, utility, info, welcome.
    // Emojis personalizados do servidor (upload via scripts/upload-emojis.js).
    emojis: {
        ticket: '1554299206167044136',
        anuncio: '1554299212437659669',
        regras: '1554299218586370129',
        ajuda: '1554299223355162645',
        vouch: '1554299230573564045',
        denuncia: '1554299236701704212',
        news: '1554299242640580648',
        chat: '1554299247690776638',
        check: '1554299255374483490',
    },
    disabledCommands: [
        'group-alerts.js',
        'group-antiraid.js',
        'group-automod.js',
        'group-birthday.js',
        'group-eco.js',
        'group-embed.js',
        'group-fun.js',
        'group-giveaway.js',
        'group-info.js',
        'group-levels.js',
        'group-modtools.js',
        'group-roles.js',
        'group-sticky.js',
        'group-suggest.js',
        'group-tags.js',
        'group-utility.js',
        'group-voice.js',
        'group-welcome.js',
        'messagecontext-messageinfo.js',
        'usercontext-userinfo.js',
    ]
};

module.exports = config;
