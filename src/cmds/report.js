//@ts-check
const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, Client, Message } = require("discord.js");

module.exports = {
    name: "report",
    aliases: ['rp'],
    permissions: [],
    execute: async (client, message, args) => {
        let reportMessage = args[0];
        let caseNumber = 0;
        await client.redis.hget('galacticFeeds:RSSInfo', 'cases', (err, res) => { caseNumber = res })

        if (!reportMessage || reportMessage.length <= 0)
            return message.reply('Must enter the \'error\' or \'user\' you\'re trying to report.');

        if (caseNumber <= 0) 
            await client.redis.hset('galacticFeeds:RSSInfo', 'cases', 1);
        else
            await client.redis.hincrby('galacticFeeds:RSSInfo', 'cases', 1);

        await client.redis.hget('galacticFeeds:RSSInfo', 'cases', (err, res) => { caseNumber = res })
        message.client.channels.cache.get('1078169449586245704').threads.create({
            name: `New Report [Report Case#${caseNumber}]`,
            autoArchiveDuration: 60,
            reason: `Bug Report`,
            message: `[${message.author}]: ${reportMessage}`
        });
    },

}