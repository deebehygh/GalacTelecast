const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help command'),
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
            .setDescription('Need help? Click on any of the buttons to help you get started.')
            .setTimestamp()

        const row = new ActionRowBuilder()
			.addComponents(new ButtonBuilder()
                .setCustomId('rssCommands')
				.setLabel('RSS Commands')
				.setStyle(ButtonStyle.Primary))
            .addComponents(new ButtonBuilder()
                .setCustomId('epicCommands')
				.setLabel('Free Epic Games Commands')
				.setStyle(ButtonStyle.Primary)) 

            interaction.reply({ embeds: [helpEmbed], components: [row], ephemeral: true })
    },
};
