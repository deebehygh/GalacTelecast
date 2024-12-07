const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const ping = new EmbedBuilder()
			.setTitle('Pinging...')
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
			.setTimestamp()
		const sent = await interaction.reply({ embeds: [ping], fetchReply: true });
		const pong = new EmbedBuilder()
			.setDescription(`Roundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`)
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
			.setTimestamp()

        await interaction.editReply({embeds: [pong]});
	},
};
