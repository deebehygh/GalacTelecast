const { SlashCommandBuilder, ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Report a bug about Galactic Feeds'),
    async execute(interaction) {
        const client = interaction.client;
        const modal = new ModalBuilder()
            .setCustomId('reportBug')
            .setTitle('Report a Bug');

        const bugTitle = new TextInputBuilder()
            .setCustomId('bugTitle')
            .setLabel("Bug Title/Error ID")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const bugInput = new TextInputBuilder()
            .setCustomId('bugInput')
            .setLabel("Please give a breif description of the bug.")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const bugRow = new ActionRowBuilder().addComponents(bugTitle)
        const bugtitle = new ActionRowBuilder().addComponents(bugInput);
        modal.addComponents(bugtitle, bugRow);
        await interaction.showModal(modal);
    },
};
