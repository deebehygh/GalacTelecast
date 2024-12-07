const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, BaseInteraction } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('twitch')
        .setDescription('Twitch notifications and settings commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subCommand => subCommand
            .setName('setup')
            .setDescription('The initial setup process for receiving lives')
            .addChannelOption(option => option.setName('channel').setDescription('The channel where you want feeds to be sent').addChannelTypes(ChannelType.GuildText).setRequired(true)))
        .addSubcommand(subCommand => subCommand
            .setName(`info`)
            .setDescription('Twitch settings and users live list'))
        .addSubcommand(subCommand => subCommand
            .setName('add')
            .setDescription('Add a user to get twitch notifications for')
            .addStringOption(option => option.setName('user').setDescription('The username').setRequired(true)))
        .addSubcommand(subCommand => subCommand
            .setName('remove')
            .setDescription('Remove a user from twitch notifications')
            .addStringOption(option => option.setName('user').setDescription('The username').setRequired(true)))
        .addSubcommand(subCommand => subCommand
            .setName('channel')
            .setDescription('The channel where lives will be sent')
            .addChannelOption(option => option.setName('channel').setDescription('The chanel').addChannelTypes(ChannelType.GuildText).setRequired(true)))
        .addSubcommand(subCommand => subCommand
            .setName(`on`)
            .setDescription('Turn your twitch feed online when ready (Offline by default)'))
        .addSubcommand(subCommand => subCommand
            .setName(`off`)
            .setDescription('Turn your twitch feed offline whenever or when changing settings. (Offline by default)')),
    async execute(/**@type {BaseInteraction}*/ interaction) {
        const redis = interaction.client.redis;

        switch (interaction.options.getSubcommand()) {
            case 'setup':

                break;
            case 'add':

                break;
            case 'remove':

                break;
            case 'on':

                break;
            case 'off':

                break;
            case 'channel':

                break;
            case 'info':

                break;
        }
    }
}