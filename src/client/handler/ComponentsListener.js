const DiscordBot = require("../DiscordBot");
const { error } = require("../../utils/Console");
const { MessageFlags } = require("discord.js");
const { t, resolveLocale } = require("../../utils/i18n");

class ComponentsListener {
    /**
     * 
     * @param {DiscordBot} client 
     */
    constructor(client) {
        client.on('interactionCreate', async (interaction) => {
            const checkUserPermissions = async (component) => {
                if (component.options?.public === false && interaction.user.id !== interaction.message.interaction.user.id) {
                    await interaction.reply({
                        content: t('handler.component_not_public', { locale: resolveLocale({ guildId: interaction.guildId, discordLocale: interaction.locale }) }),
                        flags: MessageFlags.Ephemeral
                    });

                    return false;
                }

                return true;
            }

            const safeRun = async (component, kind) => {
                try {
                    await component.run(client, interaction);
                } catch (err) {
                    error(err);
                    try {
                        if (kind === 'autocomplete') return;
                        const msg = '⚠️ Deu um erro aqui, mas o bot continua online. Tenta de novo.';
                        if (interaction.deferred || interaction.replied) await interaction.followUp({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
                        else if (interaction.isRepliable()) await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
                    } catch {}
                }
            };

            try {
                if (interaction.isButton()) {
                    const component = client.collection.components.buttons.get(interaction.customId);

                    if (!component) return;

                    if (!(await checkUserPermissions(component))) return;

                    await safeRun(component, 'button');

                    return;
                }

                if (interaction.isAnySelectMenu()) {
                    const component = client.collection.components.selects.get(interaction.customId);

                    if (!component) return;

                    if (!(await checkUserPermissions(component))) return;

                    await safeRun(component, 'select');

                    return;
                }

                if (interaction.isModalSubmit()) {
                    const component = client.collection.components.modals.get(interaction.customId);

                    if (!component) return;

                    await safeRun(component, 'modal');

                    return;
                }

                if (interaction.isAutocomplete()) {
                    const component = client.collection.components.autocomplete.get(interaction.commandName);

                    if (!component) return;

                    await safeRun(component, 'autocomplete');

                    return;
                }
            } catch (err) {
                error(err);
            }
        });
    }
}

module.exports = ComponentsListener;