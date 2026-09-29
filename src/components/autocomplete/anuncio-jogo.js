const AutocompleteComponent = require('../../structure/AutocompleteComponent');

let STATIC = [];
try { STATIC = require('../../data/games.json'); } catch { STATIC = []; }

module.exports = new AutocompleteComponent({
    commandName: 'anuncio',
    run: async (client, interaction) => {
        const focused = interaction.options.getFocused(true);
        if (focused.name !== 'jogo') return interaction.respond([]);
        const q = String(focused.value || '').toLowerCase().trim();
        const custom = client.database.get('games-' + interaction.guildId) || [];
        const all = [...new Set([...custom, ...STATIC])];
        const starts = [], contains = [];
        for (const g of all) {
            const low = g.toLowerCase();
            if (!q || low.startsWith(q)) starts.push(g);
            else if (low.includes(q)) contains.push(g);
            if (starts.length >= 25) break;
        }
        const out = [...starts, ...contains].slice(0, 25).map(g => ({ name: g.slice(0, 100), value: g.slice(0, 100) }));
        return interaction.respond(out);
    },
}).toJSON();
