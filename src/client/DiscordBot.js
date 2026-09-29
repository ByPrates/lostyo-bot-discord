const { Client, Collection, Partials } = require("discord.js");
const CommandsHandler = require("./handler/CommandsHandler");
const { warn, error, info, success } = require("../utils/Console");
let config;
try {
    config = require("../config");
} catch {
    config = require("../config.example");
}
const CommandsListener = require("./handler/CommandsListener");
const ComponentsHandler = require("./handler/ComponentsHandler");
const ComponentsListener = require("./handler/ComponentsListener");
const EventsHandler = require("./handler/EventsHandler");
const { createDatabase } = require('../db');
const { setDatabase } = require('../utils/i18n');

class DiscordBot extends Client {
    collection = {
        application_commands: new Collection(),
        message_commands: new Collection(),
        message_commands_aliases: new Collection(),
        components: {
            buttons: new Collection(),
            selects: new Collection(),
            modals: new Collection(),
            autocomplete: new Collection()
        }
    }
    rest_application_commands_array = [];
    login_attempts = 0;
    login_timestamp = 0;

    commands_handler = new CommandsHandler(this);
    components_handler = new ComponentsHandler(this);
    events_handler = new EventsHandler(this);
    database = createDatabase(config.database.path);

    constructor() {
        super({
            intents: 3276799,
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.User
            ],
            presence: {
                activities: [{
                    name: 'discord.gg/lostyo',
                    type: 4,
                    state: 'discord.gg/lostyo'
                }]
            }
        });
        
        new CommandsListener(this);
        new ComponentsListener(this);

        // Alias da nova camada (mesma interface get/set/has/delete).
        this.db = this.database;
        setDatabase(this.database);
    }

    startStatusRotation = () => {
        // Status fixo — sem rotação.
        try {
            this.user?.setPresence({ activities: [{ name: 'discord.gg/lostyo', type: 4, state: 'discord.gg/lostyo' }] });
        } catch {}
    }

    connect = async () => {
        warn(`Attempting to connect to the Discord bot... (${this.login_attempts + 1})`);

        this.login_timestamp = Date.now();

        try {
            await this.login(process.env.CLIENT_TOKEN);
            this.commands_handler.load();
            this.components_handler.load();
            this.events_handler.load();
            this.startStatusRotation();
            try {
                const { startApiServer } = require('../api/server');
                startApiServer(this);
            } catch (apiErr) {
                error('Failed to start bot API (bot continues without it):');
                error(apiErr);
            }

            warn('Attempting to register application commands... (this might take a while!)');
            try {
                await this.commands_handler.registerApplicationCommands(config.development);
                success('Successfully registered application commands. For specific guild? ' + (config.development.enabled ? 'Yes' : 'No'));
            } catch (regErr) {
                // Permanent failures (e.g. Discord's 100 commands/guild cap, code 30032, or
                // bulk payload over 130 items, code 50035) must not crash-loop the bot.
                error('Failed to register application commands, bot stays online with the last registered set:');
                error(regErr);
            }
        } catch (err) {
            error('Failed to connect to the Discord bot, retrying...');
            error(err);
            this.login_attempts++;
            setTimeout(this.connect, 5000);
        }
    }
}

module.exports = DiscordBot;
