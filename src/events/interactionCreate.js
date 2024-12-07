//@ts-check
const { SlashCommandBuilder, EmbedBuilder, BaseInteraction, Events } = require('discord.js');
const config = require("../config.js");

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {

		if (interaction.isCommand()) {
			const command = interaction.client.slashCommands.get(interaction.commandName);
			if (!command) return;

			if (!config.db.ownerIDs.includes(interaction.user.id))
				return interaction.reply({ content: 'Currently in maintenance. All services and commands disabled.', ephemeral: true})
			try {
				if (config.list.blackList.includes(interaction.user.id))
					return interaction.reply({ content: 'You are blacklisted from using Galactic Feeds', ephemeral: true });
				await command.execute(interaction);
				interaction.client.logger.on_command_used(`[${interaction.guildId}] (${interaction.channel.name}) ${interaction.user.username} used /${interaction.commandName}`)
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: error, ephemeral: true });
			}
		}

		if (interaction.isButton()) {
			const message = await interaction.fetchReply();
			const buttonID = interaction.customId;
			switch (buttonID) {
				case 'rssCommands':
					var rssEmbed = new EmbedBuilder()
						.setAuthor({ name: 'RSS Feed Commands', iconURL: interaction.user.displayAvatarURL() })
						.setColor('Aqua')
						.addFields(
							{ name: '/rss help', value: 'Rss Help Command' },
							{ name: '/rss list', value: 'Check your feed/url stats.' },
							{ name: '/rss add', value: 'Add an rss url for the bot to parser.\n**Usage:** `/rss add <url> <channel>`' },
							{ name: '/rss remove', value: 'Remove a feed from your list(s)\n**Usage:** `/rss remove <url index | url id>`' },
							{ name: '/rss update', value: 'Update where you feed(s) will be sent\n**Usage:** `/rss update <url index | url id> <channel>`' },
							{ name: '/rss on', value: 'Activate the parser. Feeds will start to send within an hour.', inline: true },
							{ name: '/rss off', value: 'Deactivate the parser.', inline: true },
							{ name: '/rss info', value: 'Check your settings and feeds list.', inline: true }
						)
						.setTimestamp()
					await message.editReply({ embeds: [rssEmbed], ephemeral: true })
					break;
				case 'twitchCommands':
					var twitchEmbed = new EmbedBuilder()
						.setAuthor({ name: 'Twitch Feed Commands', iconURL: interaction.user.displayAvatarURL() })
						.setColor('Purple')
						.addFields(
							{ name: '/twitch setup', value: 'Start the initial setup process by setting where you want twitch lives to be sent.\n**Usage:** `/twitch setup <channel>`' },
							{ name: '/twitch channel', value: 'Change where you want your twitch lives to be sent.\n**Usage:** `/twitch channel <channel>`' },
							{ name: '/twitch add', value: 'Add a twitch user\n**Usage:** `/twitch add <url>`' },
							{ name: '/twitch remove', value: 'Remove a user from your list(s)\n**Usage:** `/twitch remove <url>`' },
							{ name: '/twitch on', value: 'Activate the parser.', inline: true },
							{ name: '/twitch off', value: 'Deactivate the parser.', inline: true },
							{ name: '/twitch info', value: 'Check your settings and twitch user list.', inline: true })
						.setTimestamp()
					await message.editReply({ embeds: [twitchEmbed], ephemeral: true })
					break;
				case 'epicCommands':
					var epicEmbed = new EmbedBuilder()
						.setAuthor({ name: 'Free Epic Games Feed Commands', iconURL: interaction.user.displayAvatarURL() })
						.setColor('Aqua')
						.addFields(
							{ name: '/free-eg setup', value: 'Start the initial setup process by setting where you want the free/discounted epic games to be sent.\n**Usage:** `/free-eg setup <channel>`' },
							{ name: '/free-eg channel', value: 'Change where you want your free/discounted games to be sent\n**Usage:** `/free-eg channel <channel>`' },
							{ name: '/free-eg on', value: 'Activate the free games sender.', inline: true },
							{ name: '/free-eg off', value: 'Deactivate the free games sender.', inline: true },
						)
						.setTimestamp()
					await message.editReply({ embeds: [epicEmbed], ephemeral: true })
					break;
			}
		} else
			if (interaction.isModalSubmit()) {
				switch (interaction.customId) {
					case 'reportBug':
						const title = interaction.fields.getTextInputValue('bugTitle');
						const input = interaction.fields.getTextInputValue('bugInput');
						interaction.client.channels.cache.get('1078169449586245704').threads.create({
							name: `${title}`,
							autoArchiveDuration: 60,
							reason: `Bug Report`,
							message: `[${interaction.user}]: ${input}`
						});
						await interaction.reply({ content: 'Your report has been sent to Galactic\'s Support Server.', ephemeral: true });
						break;
				}
			}
	},
};
