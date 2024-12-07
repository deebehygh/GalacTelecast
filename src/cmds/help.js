//@ts-check
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: "help",
    aliases: ['commands', 'h'],
    permissions: [],
    execute: (client, message, args) => {
        const helpEmbed = new EmbedBuilder()
            .setDescription('Need help? Click on any of the buttons to help you get started.')
            .setTimestamp()

        const row = new ActionRowBuilder()
            .addComponents(new ButtonBuilder().setCustomId('rssCommands').setLabel('RSS Commands').setStyle(ButtonStyle.Primary))
            .addComponents(new ButtonBuilder().setCustomId('epicCommands').setLabel('Free Epic Games Commands').setStyle(ButtonStyle.Primary))

        let collector = message.channel.createMessageComponentCollector({ componentType: ComponentType.Button });
        collector.on('collect', async (/** @type {any}*/ i) => {
            if (i.user.id === message.author.id) {
                switch (i.customId) {
                    case 'rssCommands':
                        var rssEmbed = new EmbedBuilder()
                            .setAuthor({ name: 'RSS Feed Commands (Aliases: g!r)' })
                            .setColor('Aqua')
                            .addFields(
                                { name: 'g!rss help', value: 'Rss Help Command' },
                                { name: 'g!rss list', value: 'Check your feed/url stats.' },
                                { name: 'g!rss add', value: 'Add an rss url for the bot to parser.\n**Usage:** `g!rss add <url> <channel>`' },
                                { name: 'g!rss remove', value: 'Remove a feed from your list(s)\n**Usage:** `g!rss remove <url index | url id>`' },
                                { name: 'g!rss update', value: 'Update where you feed(s) will be sent\n**Usage:** `g!rss update <url index | url id> <channel>`' },
                                { name: 'g!rss on', value: 'Activate the parser. Feeds will start to send within an hour.', inline: true },
                                { name: 'g!rss off', value: 'Deactivate the parser.', inline: true },
                                { name: 'g!rss info', value: 'Check your settings and feeds list.', inline: true }
                            )
                            .setTimestamp()
                        i.reply({ embeds: [rssEmbed], ephemeral: true })
                        break;
                    case 'twitchCommands':
                        var twitchEmbed = new EmbedBuilder()
                            .setAuthor({ name: 'Twitch Feed Commands (Aliases: g!tw)' })
                            .setColor('Purple')
                            .addFields(
                                { name: 'g!twitch setup', value: 'Start the initial setup process by setting where you want twitch lives to be sent.\n**Usage:** `g!twitch setup <channel>`' },
                                { name: 'g!twitch channel', value: 'Change where you want your twitch lives to be sent.\n**Usage:** `g!twitch channel <channel>`' },
                                { name: 'g!twitch add', value: 'Add a twitch user\n**Usage:** `g!twitch add <url>`' },
                                { name: 'g!twitch remove', value: 'Remove a user from your list(s)\n**Usage:** `g!twitch remove <url>`' },
                                { name: 'g!twitch on', value: 'Activate the parser.', inline: true },
                                { name: 'g!twitch off', value: 'Deactivate the parser.', inline: true },
                                { name: 'g!twitch info', value: 'Check your settings and twitch user list.', inline: true })
                            .setTimestamp()
                        i.reply({ embeds: [twitchEmbed], ephemeral: true })
                        break;
                    case 'epicCommands':
                        var epicEmbed = new EmbedBuilder()
                            .setAuthor({ name: 'Free Epic Games Feed Commands (Aliases: g!frg)' })
                            .setColor('Aqua')
                            .addFields(
                                { name: 'g!free-eg setup', value: 'Start the initial setup process by setting where you want the free/discounted epic games to be sent.\n**Usage:** `g!free-eg setup <channel>`' },
                                { name: 'g!free-eg channel', value: 'Change where you want your free/discounted games to be sent\n**Usage:** `g!free-eg channel <channel>`' },
                                { name: 'g!free-eg on', value: 'Activate the free games sender.', inline: true },
                                { name: 'g!free-eg off', value: 'Deactivate the free games sender.', inline: true },
                            )
                            .setTimestamp()
                        i.reply({ embeds: [epicEmbed], ephemeral: true })
                        break;
                }
            } else {
                i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
            }
        })

        message.channel.send({ embeds: [helpEmbed], components: [row], ephemeral: true })
    },

}