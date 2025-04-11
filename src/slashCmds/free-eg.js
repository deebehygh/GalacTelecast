//@ts-check
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('free-eg')
		.setDescription('Free epic games commands')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand => subcommand
			.setName('setup')
			.setDescription('The initial setup process for receiving free games news')
			.addChannelOption(option => option.setName('channel').setDescription('The channel').setRequired(true).addChannelTypes(ChannelType.GuildText)))
		.addSubcommand(subCommand => subCommand
			.setName(`info`)
			.setDescription('View your Free Epic Games settings'))
		.addSubcommand(subcommand => subcommand
			.setName('channel')
			.setDescription('The channel where free game will send')
			.addChannelOption(option => option.setName('channeld').setDescription('The channel').setRequired(true).addChannelTypes(ChannelType.GuildText)))
		.addSubcommand(subcommand => subcommand
			.setName('on')
			.setDescription('Activate free games feed'))
		.addSubcommand(subcommand => subcommand
			.setName('off')
			.setDescription('Deactivate free games feed')),
	async execute(interaction) {
		const redis = interaction.client.redis;
		const guildId = interaction.guildId;
		const logger = interaction.client.logger;

		let guildExists = await redis.sIsMember('epicGuilds_:gList_', interaction.guildId);

		switch (interaction.options.getSubcommand()) {
			case 'setup':
				var channel = interaction.options.getChannel('channel');
				if (guildExists) {
					var errEmbed = new EmbedBuilder()
						.setTitle('❗Error❗').setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
						.setDescription(`Seems you haven't did the setup. To setup for your free games feed, please use the \`/free-eg setup\` command.`).setTimestamp().setFooter({ text: ' • Rss' })
					return await interaction.reply({ embeds: [errEmbed], ephemeral: true });
				}

				var sucEmbed = new EmbedBuilder()
					.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
					.addFields(
						{ name: '📓 Channel Log', value: `${channel}`, inline: true },
						{ name: '🚦 Parser Status', value: `🔴 Deactivated`, inline: true },
						{ name: 'Helpful Information', value: '[1] __How to turn feeds online?__\nUse the `/free-eg on` command\n\n[2] __How to change the channel id?__\nUse the `/free-eg channel` command\n\n*There is no timer you can change with this feature. Once a game is posted, it\'ll wait until the next game is free or at a discounted price. This can take a week or 2 and it can not be change via command or by the developers.*' })
					.setTimestamp()
					.setColor('Aqua')
					.setFooter({ text: ' • Epic Games' })

				await redis.sAdd(`epicGuilds_:gList_`, guildId);
				await redis.hSet(`epicGuilds_:${guildId}:freeEpicGamesSettings`, { online: "0" });
                await redis.hSet(`epicGuilds_:${guildId}:freeEpicGamesSettings`, { channelId: `${channel.id}` });
                await redis.hSet(`epicGuilds_:${guildId}:freeEpicGamesSettings`, { totalNumGamesPosted: "0" });
				await interaction.reply({ embeds: [sucEmbed], ephemeral: true })
				await logger.event(`[${guildId}]: ${interaction.user.tag} created a new Epic Games database file.`);
				break;
			case 'channel':
				var channel = interaction.options.getChannel('channeld')
				if (!guildExists) {
					var errEmbed = new EmbedBuilder()
						.setTitle('❗Error❗').setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
						.setDescription(`Seems you haven't did the setup. To setup for your free games feed, please use the \`/free-eg setup\` command.`).setTimestamp().setFooter({ text: ' • Rss' })
					return await interaction.reply({ embeds: [errEmbed], ephemeral: true });
				}
				await redis.hSet(`epicGuilds_:${guildId}:freeEpicGamesSettings`, { channelId: channel.id })
				var channelEmbed = new EmbedBuilder()
					.setTitle('<:gfeeds:1085657013209534606> Updating Channel Log...')
					.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
					.setDescription(`Free/Discounted games will be sent to ${channel}`)
					.setTimestamp().setColor('Aqua').setFooter({ text: ' • Epic Games' })
				await interaction.reply({ embeds: [channelEmbed], ephemeral: true })
				await logger.event(`[${guildId}]: ${interaction.user.tag} changed Epic Games feeds channel to ${channel}`);
				break;
			case 'on':
				if (!guildExists) {
					var errEmbed = new EmbedBuilder()
						.setTitle('❗Error❗').setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
						.setDescription(`Seems you haven't did the setup. To setup for your free games feed, please use the \`/free-eg setup\` command.`).setTimestamp().setFooter({ text: ' • Rss' })
					return await interaction.reply({ embeds: [errEmbed], ephemeral: true });
				}
				await redis.hSet(`epicGuilds_:${guildId}:freeEpicGamesSettings`, { online: "true" })
				var onEmbed = new EmbedBuilder()
					.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
					.setTitle(`🟢 Free Games Sender: Activated!`).setTimestamp().setColor('Aqua').setFooter({ text: ' • Epic Games' })
				await interaction.reply({ embeds: [onEmbed], ephemeral: true });
				await logger.event(`[${guildId}]: ${interaction.user.tag} turned on Epic Games feeds.`);

				break;
			case 'off':
				if (!guildExists) {
					var errEmbed = new EmbedBuilder()
						.setTitle('❗Error❗').setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
						.setDescription(`Seems you haven't did the setup. To setup for your free games feed, please use the \`/free-eg setup\` command.`).setTimestamp().setFooter({ text: ' • Rss' })
					return await interaction.reply({ embeds: [errEmbed], ephemeral: true });
				}
				await redis.hSet(`epicGuilds_:${guildId}:freeEpicGamesSettings`, { online: false })
				var onEmbed = new EmbedBuilder()
					.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
					.setTitle(`🔴 Free Games Sender: Deactivated`)
					.setTimestamp()
					.setColor('Aqua')
					.setFooter({ text: ' • Epic Games' })
				await interaction.reply({ embeds: [onEmbed], ephemeral: true });
				logger.event(`[${guildId}]: ${interaction.user.tag} turned off Epic Games feeds.`);

				break;
			case 'info':
				var channelId = await redis.hGet(`epicGuilds_:${guildId}:freeEpicGamesSettings`, 'channelId')
				var online = await redis.hGet(`epicGuilds_:${guildId}:freeEpicGamesSettings`, 'online')
				if (guildExists <= 0) {
					var errEmbed = new EmbedBuilder()
						.setTitle('❗Error❗').setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
						.setDescription(`Seems you haven't did the setup. To setup for your free games feed, please use the \`/free-eg setup\` command.`).setTimestamp().setFooter({ text: ' • Rss' })
					return await interaction.reply({ embeds: [errEmbed], ephemeral: true });
				}
				const listEmbed = new EmbedBuilder()
					.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
					.setThumbnail(interaction.guild.iconURL())
					.setTitle(`<:gfeeds:1085657013209534606> Your Free Epic Games Settings`)
					.setDescription(`Here you can manage and view your Free Epic Games settings.`)
					.addFields(
						{ name: '📓 Feeds Channel', value: `<#${channelId}>`, inline: true },
						{ name: '⏲️ Refresh Timer', value: `1h`, inline: true },
						{ name: '🚦 Parser Status', value: `${online === 0 ? "🔴 Deactivated" : "🟢 Activated"}`, inline: true })
					.setTimestamp().setColor('Purple').setFooter({ text: ' • Epic Games' })

				interaction.reply({ embeds: [listEmbed] })
				break;
		}
	},
};
