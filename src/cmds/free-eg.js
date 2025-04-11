//@ts-check
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "free-eg",
    aliases: ['frg'],
    permissions: [],
    execute: async (client, message, args) => {
        const subCommand = args[0];

        let guildExists = await client.redis.sIsMember('epicGuilds_:gList_', message.guildId);

        if (!message.member?.permissions.has(PermissionFlagsBits.Administrator))
            return message.reply('You do not have permission to use this command.')

        switch (subCommand) {
            case 'setup':
                let channel = message.mentions.channels.first();
                console.log(guildExists)
                
                var sucEmbed = new EmbedBuilder()
                    .addFields(
                        { name: '📓 Channel Log', value: `${channel}`, inline: true },
                        { name: '🚦 Parser Status', value: `🔴 Deactivated`, inline: true },
                        { name: 'Helpful Information', value: '[1] __How to turn feeds online?__\nUse the `/free-eg on` command\n\n[2] __How to change the channel id?__\nUse the `/free-eg channel` command\n\n*There is no timer you can change with this feature. Once a game is posted, it\'ll wait until the next game is free or at a discounted price. This can take a week or 2 and it can not be change via command or by the developers.*' })
                    .setTimestamp()
                    .setColor('Aqua')
                    .setFooter({ text: ' • Epic Games' })

                await client.redis.sAdd(`epicGuilds_:gList_`, message.guildId);
                await client.redis.hSet(`epicGuilds_:${message.guildId}.freeEpicGamesSettings`, { online: "0" });
                await client.redis.hSet(`epicGuilds_:${message.guildId}.freeEpicGamesSettings`, { channelId: `${channel.id}` });
                await client.redis.hSet(`epicGuilds_:${message.guildId}.freeEpicGamesSettings`, { totalNumGamesPosted: "0" });
                await message.channel.send({ embeds: [sucEmbed], ephemeral: true })
                console.log(`[${message.guildId}]: ${message.author.username} created a new Epic Games database file.`);
                break;
            case 'channel':
                let channelLog = message.mentions.channels.first();

                if (guildExists <= 0) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗')
                        .setDescription(`Seems you haven't did the setup process. Please use the \`/free-eg setup\` command.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await message.reply({ embeds: [errEmbed], ephemeral: true });
                }
                await client.redis.hSet(`epicGuilds_:${message.guildId}.freeEpicGamesSettings`, { channelId: channelLog.id })
                var channelEmbed = new EmbedBuilder()
                    .setTitle('<:gfeeds:1085657013209534606> Updating Channel Log...')
                    .setDescription(`Free/Discounted games will be sent to ${channelLog}`)
                    .setTimestamp().setColor('Aqua').setFooter({ text: ' • Epic Games' })
                await message.channel.send({ embeds: [channelEmbed], ephemeral: true })
                console.log(`[${message.guildId}]: ${message.author.username} changed Epic Games feeds channel to ${channelLog}`);

                break;
            case 'on':
                if (guildExists <= 0) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗')
                        .setDescription(`Seems you haven't did the setup process. Please use the \`/free-eg setup\` command.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await message.reply({ embeds: [errEmbed], ephemeral: true });
                }
                await client.redis.hSet(`epicGuilds_:${message.guildId}.freeEpicGamesSettings`, `online`, true)
                var onEmbed = new EmbedBuilder()
                    .setTitle(`🟢 Free Games Sender: Activated!`)
                    .setTimestamp().setColor('Aqua').setFooter({ text: ' • Epic Games' })
                await message.channel.send({ embeds: [onEmbed], ephemeral: true });
                console.log(`[${message.guildId}]: ${message.author.username} turned on Epic Games feeds.`);

                break;
            case 'off':
                if (guildExists <= 0) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗')
                        .setDescription(`Seems you haven't did the setup process. Please use the \`/free-eg setup\` command.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await message.reply({ embeds: [errEmbed], ephemeral: true });
                }
                await client.redis.hSet(`epicGuilds_:${message.guildId}.freeEpicGamesSettings`, `online`, false)
                var onEmbed = new EmbedBuilder()
                    .setTitle(`🔴 Free Games Sender: Deactivated`)
                    .setTimestamp().setColor('Aqua').setFooter({ text: ' • Epic Games' })
                await message.channel.send({ embeds: [onEmbed], ephemeral: true });
                console.log(`[${message.guildId}]: ${message.author.username} turned off Epic Games feeds.`);

                break;
            case 'info':
                var channelId = await client.redis.hGet(`epicGuilds_:${message.guildId}.freeEpicGamesSettings`, 'channelId')
                var online = await client.redis.hGet(`epicGuilds_:${message.guildId}.freeEpicGamesSettings`, 'online')
                if (guildExists <= 0) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗')
                        .setDescription(`Seems you haven't did the setup process. Please use the \`/free-eg setup\` command.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await message.reply({ embeds: [errEmbed], ephemeral: true });
                }
                const listEmbed = new EmbedBuilder()
                    .setTitle(`<:gfeeds:1085657013209534606> Your Free Epic Games Settings`)
                    .setDescription(`Here you can manage and view your Free Epic Games settings.`)
                    .addFields(
                        { name: '📓 Feeds Channel', value: `<#${channelId}>`, inline: true },
                        { name: '⏲️ Refresh Timer', value: `1h`, inline: true },
                        { name: '🚦 Parser Status', value: `${online === 0 ? "🔴 Deactivated" : "🟢 Activated"}`, inline: true })
                    .setTimestamp().setColor('Purple').setFooter({ text: ' • Epic Games' })

                message.channel.send({ embeds: [listEmbed] })
                break;
        }
    },

}