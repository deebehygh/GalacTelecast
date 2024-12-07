//@ts-check
const { EmbedBuilder, PermissionFlagsBits, Message } = require("discord.js");
const { isValidURL, to, website_status } = require('../ext/ExtFunctions.js');
const { ExtClient } = require('../ext/ExtClient.js');
const { EntityId } = require("redis-om");

module.exports = {
    name: "rss",
    aliases: ["r"],
    permissions: [PermissionFlagsBits.Administrator],
    execute: async (/**@type {ExtClient}*/ client, /**@type {any}*/ message, /**@type {any}*/ args) => {
        const subCommand = args[0];
        const redis = client.redis;
        let guildExists = await redis.sIsMember('rssGuilds_:gList_', message.guildId);

        if (!message.member?.permissions.has(PermissionFlagsBits.Administrator))
            return message.reply('You do not have permission to use this command.')

        switch (subCommand) {
            case 'help':
                var helpEmbed = new EmbedBuilder()
                    .setAuthor({ name: message.author.username})
                    .addFields(
                        {
                            name: '[1] How to turn feeds online?',
                            value: 'Use the `g!rss on` command'
                        },
                        {
                            name: '[2] How to change the channel for a url?',
                            value: 'Use the `g!rss update` command. You must know the index (id) of the url to update its channel. You can find that out with the `g!rss list` command'
                        },
                        {
                            name: '[3] How to add Rss Url?',
                            value: 'You can use the `g!rss add` command to add feeds'
                        },
                        {
                            name: '[4] How can I change the feed refresh timer?',
                            value: 'Feed timers are set to 1 hour (60 minutes) by default. To change this, use the `g!rss timer` command. Please remember the units are in minutes and not hours or seconds.'
                        })
                    .setTimestamp()
                    .setColor('Aqua')
                    .setFooter({ text: ' • Rss' })
                await message.reply({ embeds: [helpEmbed] })
                break;
            case 'add':
                var feedUrl = args[1];
                var feedChannel = client.channels.cache.get(args[2]) || message.mentions.channels.first();
                let feedCount = redis.hGet(`rssGuilds_:${message.guildId}:feedSettings`, `feedCount`);

                //#region Embeds
                var sucEmbed = new EmbedBuilder()
                    .setTitle('<:gfeeds:1085657013209534606> New Feed Url Added')
                    .setDescription(`**${feedUrl}**`).setTimestamp().setColor('Aqua').setFooter({ text: ' • Rss' })
                var noURL = new EmbedBuilder()
                    .setTitle('❗Error❗')
                    .setDescription(`The feed you are trying to add is not an url.`).setTimestamp().setFooter({ text: ' • Rss' })
                var errEmbed = new EmbedBuilder().setTitle('❗Error❗').setTimestamp().setFooter({ text: ' • Rss' })
                //#endregion

                if (!feedUrl) {
                    errEmbed.setDescription('Must include an url to add')
                    return message.reply({ embeds: [errEmbed] })
                } else if (!feedChannel) {
                    errEmbed.setDescription('Must include a channel with the url to add')
                    return message.reply({ embeds: [errEmbed] })
                }

                if (!guildExists) {
                    var gerrEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗')
                        .setDescription(`An unexpected error has occurred. Please contact a developer about this.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await message.reply({ embeds: [gerrEmbed] });
                }

                if (!isValidURL(feedUrl))
                    await message.reply({ embeds: [noURL] });

                //if (guildFeedList.includes(feedUrl)) return message.reply({ embeds: [failedEmbed] });
                let keyExists = await redis.json.get(`rssGuilds_:${message.guildId}:feedList`);
                if (!keyExists) await redis.json.set(`rssGuilds_:${message.guildId}:feedList`, '$', { feeds: [{ url: feedUrl, channel: feedChannel.id, feedsReceived: 0 }] });
                else await redis.json.arrAppend(`rssGuilds_:${message.guildId}:feedList`, '$.feeds', { url: feedUrl, channel: feedChannel.id, feedsReceived: 0 });
                await redis.hIncrBy(`rssGuilds_:${message.guildId}:feedSettings`, `feedCount`, 1)
                await message.reply({ embeds: [sucEmbed] });
                console.log(`[${message.guildId}]: ${message.author.username} added a new feed url (${feedUrl}).`);

                break;
            case 'remove':
                var feedIndex = args[1];
                let urlExist = await redis.json.get(`rssGuilds_:${message.guildId}:feedList`)
                let farray = [];
                var tryingEmbed = new EmbedBuilder().setTitle(`<:gfeeds:1085657013209534606> Removing feed...`).setTimestamp().setColor('Aqua').setFooter({ text: ' • Rss' })
                var errEmbed = new EmbedBuilder().setTitle('❗Error❗').setTimestamp().setFooter({ text: ' • Rss' })
                if (!feedIndex) {
                    errEmbed.setDescription('Must include an url index to update its channel')
                    return message.reply({ embeds: [errEmbed] })
                }
                else if (isNaN(feedIndex)) {
                    errEmbed.setDescription('The url index must be a number and not a string or array')
                    return message.reply({ embeds: [errEmbed] })
                }
                if (!guildExists) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗')
                        .setDescription(`An unexpected error has occurred. Please contact a developer about this.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await message.reply({ embeds: [errEmbed] });
                }

                /*if (!urlExist) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗')
                        .setDescription(`That url does not exists in the database. Please use the \`/rss info\` command to check your urls.`)
                        .setTimestamp().setFooter({ text: ' • Rss' })
                    return await message.reply({ embeds: [errEmbed] });
                }*/

                let msg = await message.reply({ embeds: [tryingEmbed] });
                await client.redis.json.arrPop(`rssGuilds_:${message.guildId}:feedList`, `$.feeds`, feedIndex)
                await redis.hIncrBy(`rssGuilds_:${message.guildId}:feedSettings`, `feedCount`, -1)
                let flist_ = await client.redis.json.get(`rssGuilds_:${message.guildId}:feedList`);
                for (var [index, iii] of Object.entries(flist_.feeds))
                    farray.push(`**[${index}]** Url: ${iii.url}\nUrl Channel: ${iii.channel}`)


                var listEmbe = new EmbedBuilder()
                    .setTitle('<:gfeeds:1085657013209534606> New Feed List')
                    .setDescription(`${farray.join("")}`).setTimestamp().setColor('Aqua').setFooter({ text: ' • Rss' })

                await msg.edit({ embeds: [listEmbe] });
                console.log(`[${message.guildId}]: ${message.author.username} from [${feedIndex}]`);

                break;
            case 'on':
                if (!guildExists) {
                    let errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗')
                        .setDescription(`An unexpected error has occurred. Please contact a developer about this.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await message.reply({ embeds: [errEmbed] });
                }
                await redis.hSet(`rssGuilds_:${message.guildId}:feedSettings`, { online: true })
                let onEmbed = new EmbedBuilder()
                    .setTitle(`🟢 Parser Status: Activated`).setTimestamp().setColor('Aqua').setFooter({ text: ' • Rss' })
                await message.reply({ embeds: [onEmbed] });
                console.log(`[${message.guildId}]: ${message.author.username} turned on feeds.`);

                break;
            case 'off':
                if (!guildExists) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗')
                        .setDescription(`An unexpected error has occurred. Please contact a developer about this.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await message.reply({ embeds: [errEmbed] });
                }
                await redis.hSet(`rssGuilds_:${message.guildId}:feedSettings`, { online: false })
                var offEmbed = new EmbedBuilder()
                    .setTitle(`🔴 Parser Status: Deactivated`).setTimestamp().setColor('Aqua').setFooter({ text: ' • Rss' })
                await message.reply({ embeds: [offEmbed] });
                console.log(`[${message.guildId}]: ${message.author.username} turned off feeds.`);
                break;
            case 'info':
                let isOnline = await redis.hGet(`rssGuilds_:${message.guildId}:feedSettings`, `online`);
                let guildTime = await redis.hGet(`rssGuilds_:${message.guildId}:feedSettings`, `timer`);
                if (!guildExists) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗')
                        .setDescription(`An unexpected error has occurred. Please contact a developer about this.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await message.reply({ embeds: [errEmbed] });
                }

                const listEmbed = new EmbedBuilder()
                    .setThumbnail(message.guild.iconURL())
                    .setTitle(`<:gfeeds:1085657013209534606> Your RSS Feed Settings & List`)
                    .setDescription(`Here you can manage and view your RSS feeds settings.`)
                    .addFields(
                        { name: '⏲️ Refresh Timer', value: `${guildTime}m`, inline: true },
                        { name: '🚦 Parser Status', value: `${!Boolean(isOnline) ? "🔴 Deactivated" : "🟢 Activated"}`, inline: true },
                    )
                    .setTimestamp().setColor('Aqua').setFooter({ text: ' • Rss' })
                await message.reply({ embeds: [listEmbed] });
                break;
            case 'update':
                let idx = args[1];
                let newChannel = client.channels.cache.get(args[2]) || message.mentions.channels.first();
                let [err, getFeed] = await to(redis.json.get(`rssGuilds_:${message.guildId}:feedList`));
                var errEmbed = new EmbedBuilder().setTitle('❗Error❗').setTimestamp().setFooter({ text: ' • Rss' })
                if (err) message.reply(err)
                if (!idx) {
                    errEmbed.setDescription('Must include an url index to update its channel')
                    return message.reply({ embeds: [errEmbed] })
                } else if (isNaN(idx)) {
                    errEmbed.setDescription('The url index must be a number and not a string or array')
                    return message.reply({ embeds: [errEmbed] })
                }

                if (!newChannel) {
                    errEmbed.setDescription('Must select a channel you want new feeds to be sent.')
                    return message.reply({ embeds: [errEmbed] })
                }
                if (!getFeed.feeds[idx]) {
                    errEmbed.setDescription('That url index does not exist. Please use the "g!rss list" to check you url indexes')
                    return message.reply({ embeds: [errEmbed] })
                }

                await redis.json.arrPop(`rssGuilds_:${message.guildId}:feedList`, `$.feeds`, feedIndex)
                await redis.json.arrAppend(`rssGuilds_:${message.guildId}:feedList`, '$.feeds', { url: getFeed.feeds[idx].url, channel: newChannel.id, feedsReceived: getFeed.feeds[idx].feedsReceived });
                message.reply(`Successfully update rss channel to ${newChannel}`)
                break;
            case 'list':
                let fList_ = await redis.json.get(`rssGuilds_:${message.guildId}:feedList`);
                let fembed = new EmbedBuilder().setColor('Aqua').setTimestamp().setFooter({ text: ' • Rss' })
                //let fArray = [];

                for (var [indx, iii] of Object.entries(fList_?.feeds)) {
                    let websiteCheck = await website_status(iii.url);
                    if (iii.feedsReceived === undefined) iii.feedsReceived = 0;
                    fembed.addFields({ name: `[Url #${indx}] ${iii.url}`, value: `**Website Status: **\`${websiteCheck ? '🟢 Online' : '🔴 May be expessing issues'}\`\n**Feeds Recieved: **\`${iii.feedsReceived}\`\n**Channel: **<#${iii.channel}>` })
                }
                await message.reply({ embeds: [fembed] })
                break;
        }
    },

}