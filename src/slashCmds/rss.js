//@ts-check
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const stripTags = require("striptags")
const { isValidURL, website_status, to } = require('../ext/ExtFunctions.js');
const { ExtRss } = require('../ext/ExtRss.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rss')
        .setDescription('Rss info and settings commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand => subcommand
            .setName(`add`)
            .setDescription('Add an RSS feed url')
            .addStringOption(option => option.setName('url').setDescription('Rss url').setRequired(true))
            .addChannelOption(option => option.setName('channel').setDescription('The channel the feeds will be sent').setRequired(true).addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(subcommand => subcommand
            .setName(`remove`)
            .setDescription('Remove a feed from your list')
            .addNumberOption(option => option.setName('index').setDescription('The index number of the url (The number in [])').setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName(`timer`)
            .setDescription('Change how long you want your parser to refresh (Units is minutes)')
            .addNumberOption(option => option.setName('time').setDescription('The time').setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName(`info`)
            .setDescription('Check your feed settings'))
        .addSubcommand(subcommand => subcommand
            .setName(`on`)
            .setDescription('Turn your Rss feed online when ready (Offline by default)'))
        .addSubcommand(subcommand => subcommand
            .setName(`off`)
            .setDescription('Turn your feed offline whenever or when changing settings. (Offline by default)'))
        .addSubcommand(subcommand => subcommand
            .setName('list')
            .setDescription('Get servers\' your rss list'))
        .addSubcommand(subcommand => subcommand
            .setName('update')
            .setDescription('Update a feeds\' channel')
            .addNumberOption(option => option.setName('findex').setDescription('The index number of the url (The number in [])').setRequired(true))
            .addChannelOption(option => option.setName('newchannel').setDescription('The new channel').addChannelTypes(ChannelType.GuildText).setRequired(true))),
    async execute(interaction) {
        const redis = interaction.client.redis;
        const logger = interaction.client.logger;

        let guildExists = await redis.sIsMember('rssGuilds_:gList_', interaction.guildId);

        switch (interaction.options.getSubcommand()) {
            case 'help':
                var helpEmbed = new EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .addFields(
                        {
                            name: '[1] How to turn feeds online?',
                            value: 'Use the `/rss on` command'
                        },
                        {
                            name: '[2] How to change the channel for a url?',
                            value: 'Use the `/rss update` command. You must know the index (id) of the url to update its channel. You can find that out with the `/rss list` command'
                        },
                        {
                            name: '[3] How to add Rss Url?',
                            value: 'You can use the `/rss add` to add feeds'
                        },
                        {
                            name: '[4] How can I change the feed refresh timer?',
                            value: 'Feed timers are set to 1 hour (60 minutes) by default. To change this, use the `/rss timer` command. Please remember the units are in minutes and not hours or seconds.'
                        })
                    .setTimestamp()
                    .setColor('Aqua')
                    .setFooter({ text: ' • Rss' })
                await interaction.reply({ embeds: [helpEmbed], ephemeral: true })
                break;
            case 'add':
                var feedUrl = interaction.options.getString('url');
                var feedChannel = interaction.options.getChannel('channel');
                let feedCount = redis.hGet(`rssGuilds_:${interaction.guildId}:feedSettings`, `feedCount`);

                //#region Embeds
                var sucEmbed = new EmbedBuilder()
                    .setTitle('<:gfeeds:1085657013209534606> New Feed Url Added')
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`**${feedUrl}**`).setTimestamp().setColor('Aqua').setFooter({ text: ' • Rss' })
                var noURL = new EmbedBuilder()
                    .setTitle('❗Error❗').setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`The feed you are trying to add is not an url.`).setTimestamp().setFooter({ text: ' • Rss' })
                //#endregion

                if (!guildExists) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗').setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                        .setDescription(`Please use the \`/update\` command to update your servers' settings.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await interaction.reply({ embeds: [errEmbed], ephemeral: true });
                }

                if (!isValidURL(feedUrl))
                    await interaction.reply({ embeds: [noURL], ephemeral: true });

                //if (guildFeedList.includes(feedUrl)) return interaction.reply({ embeds: [failedEmbed], ephemeral: true });
                let keyExists = await redis.json.get(`rssGuilds_:${interaction.guildId}:feedList`);
                if (!keyExists) await redis.json.set(`rssGuilds_:${interaction.guildId}:feedList`, '$', { feeds: [{ url: feedUrl, channel: feedChannel.id, feedsReceived: 0 }] });
                else await redis.json.arrAppend(`rssGuilds_:${interaction.guildId}:feedList`, '$.feeds', { url: feedUrl, channel: feedChannel.id, feedsReceived: 0 });
                await redis.hIncrBy(`rssGuilds_:${interaction.guildId}:feedSettings`, `feedCount`, 1)
                await interaction.reply({ embeds: [sucEmbed], ephemeral: true });
                await logger.event(`[${interaction.guildId}]: ${interaction.user.tag} added a new feed url (${feedUrl}).`);

                break;
            case 'remove':
                var feedIndex = interaction.options.getNumber('index');
                //let urlExist = await redis.sIsMember(`rssGuilds_:${interaction.guildId}:feedList`, feedIndex)
                let farray = [];

                var tryingEmbed = new EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setTitle(`<:gfeeds:1085657013209534606> Removing feed...`)
                    .setTimestamp().setColor('Aqua').setFooter({ text: ' • Rss' })

                if (!guildExists) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗').setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                        .setDescription(`Please use the \`/update\` command to update your servers' settings.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await interaction.reply({ embeds: [errEmbed], ephemeral: true });
                }

                await interaction.reply({ embeds: [tryingEmbed], ephemeral: true });
                await redis.json.arrPop(`rssGuilds_:${interaction.guildId}:feedList`, `$.feeds`, feedIndex);
                await redis.hIncrBy(`rssGuilds_:${interaction.guildId}:feedSettings`, `feedCount`, -1);
                let flist_ = await redis.json.get(`rssGuilds_:${interaction.guildId}:feedList`);
                for (var [index, iii] of flist_.feeds.entries())
                    farray.push(`**[${index}]** Url: ${iii.url}\nUrl Channel: <#${iii.channel}>\n\n`);

                var listEmbe = new EmbedBuilder()
                    .setTitle('<:gfeeds:1085657013209534606> New Feed List')
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                    .setDescription(`${farray.join("")}`).setTimestamp().setColor('Aqua').setFooter({ text: ' • Rss' })

                await interaction.editReply({ embeds: [listEmbe], ephemeral: true });
                logger.event(`[${interaction.guildId}]: ${interaction.user.tag} from [${feedIndex}]`);

                break;
            case 'on':
                var onEmbed = new EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setTitle(`🟢 Parser Status: Activated`).setTimestamp().setColor('Aqua').setFooter({ text: ' • Rss' })

                if (!guildExists) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗').setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                        .setDescription(`Please use the \`/update\` command to update your servers' settings.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await interaction.reply({ embeds: [errEmbed], ephemeral: true });
                }

                await redis.hSet(`rssGuilds_:${interaction.guildId}:feedSettings`, { online: 'true' });
                await interaction.reply({ embeds: [onEmbed], ephemeral: true });
                await logger.event(`[${interaction.guildId}]: ${interaction.user.tag} turned on feeds.`);
                break;
            case 'off':
                var offEmbed = new EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setTitle(`🔴 Parser Status: Deactivated`).setTimestamp().setColor('Aqua').setFooter({ text: ' • Rss' })

                if (!guildExists) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗').setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                        .setDescription(`Please use the \`/update\` command to update your servers' settings.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await interaction.reply({ embeds: [errEmbed], ephemeral: true });
                }

                await redis.hSet(`rssGuilds_:${interaction.guildId}:feedSettings`, { online: 'false' });
                await interaction.reply({ embeds: [offEmbed], ephemeral: true });
                await logger.event(`[${interaction.guildId}]: ${interaction.user.tag} turned off feeds.`);
                break;
            case 'info':
                let isOnline = await redis.hGet(`rssGuilds_:${interaction.guildId}:feedSettings`, `online`);
                let guildTime = await redis.hGet(`rssGuilds_:${interaction.guildId}:feedSettings`, `timer`);

                if (!guildExists) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗').setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                        .setDescription(`Please use the \`/update\` command to update your servers' settings.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await interaction.reply({ embeds: [errEmbed], ephemeral: true });
                }


                const infoEmbedd = new EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                    .setThumbnail(interaction.guild.iconURL())
                    .setTitle(`<:gfeeds:1085657013209534606> Your RSS Feed Settings & List`)
                    .setDescription(`Here you can manage and view your RSS feeds settings.`)
                    .addFields(
                        { name: '⏲️ Refresh Timer', value: `${guildTime}m`, inline: true },
                        { name: '🚦 Parser Status', value: `${!isOnline ? "🔴 Deactivated" : "🟢 Activated"}`, inline: true },
                    ).setTimestamp().setColor('Aqua').setFooter({ text: ' • Rss' })
                await interaction.reply({ embeds: [infoEmbedd], ephemeral: true });

                break;
            case 'timer':
                let rsstime = interaction.options.getNumber('time');
                let timerEmbed = new EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`**Error | ❗❗**\nYou can not set the timer shorter than 30 minutes`)
                    .setTimestamp().setFooter({ text: ' • Rss' })

                if (!guildExists) {
                    var errEmbed = new EmbedBuilder()
                        .setTitle('❗Error❗').setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                        .setDescription(`Please use the \`/update\` command to update your servers' settings.`).setTimestamp().setFooter({ text: ' • Rss' })
                    return await interaction.reply({ embeds: [errEmbed], ephemeral: true });
                }

                if (rsstime <= 29) return interaction.reply({ embeds: [timerEmbed], ephemeral: true });
                await redis.hSet(`rssGuilds_:${interaction.guildId}:feedSettings`, { timer: rsstime })
                let timeEmbed = new EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() }).setColor('Aqua')
                    .setDescription(`Your feeds will now start sending in ${rsstime} minutes.`).setTimestamp().setFooter({ text: ' • Rss' })
                await interaction.reply({ embeds: [timeEmbed], ephemeral: true })
                logger.event(`[${interaction.guildId}]: ${interaction.user.tag} changed feed time to ${rsstime} minutes`)
                break;
            case 'list':
                let fList_ = await redis.json.get(`rssGuilds_:${interaction.guildId}:feedList`);
                let fembed = new EmbedBuilder().setColor('Aqua').setTimestamp().setFooter({ text: ' • Rss' })
                //let fArray = [];
                if (!fList_) {
                    fembed.setDescription('No feeds found. Use the `/rss add` command to add a feed.')
                    return interaction.reply({ embeds: [fembed], ephemeral: true })
                }
                for (var [indx, iii] of Object.entries(fList_.feeds)) {
                    let websiteCheck = await website_status(iii.url);
                    if (iii.feedsReceived === undefined) iii.feedsReceived = 0;
                    fembed.addFields({ name: `[Url #${indx}] ${iii.url}`, value: `**Website Status: **\`${websiteCheck ? '🟢 Online' : '🔴 May be expessing issues'}\`\n**Feeds Recieved: **\`${iii.feedsReceived}\`\n**Channel: **<#${iii.channel}>` })
                }
                await interaction.reply({ embeds: [fembed], ephemeral: true })
                break;
            case 'update':
                let idx = interaction.options.getNumber('findex');
                let newChannel = interaction.options.getChannel('newchannel');
                let [err, getFeed] = await to(redis.json.get(`rssGuilds_:${interaction.guildId}:feedList`));
                var errEmbed = new EmbedBuilder().setTitle('❗Error❗').setTimestamp().setFooter({ text: ' • Rss' })
                if (err) interaction.reply(err)
                if (!idx) {
                    errEmbed.setDescription('Must include an url index to update its channel')
                    return interaction.reply({ embeds: [errEmbed], ephemeral: true })
                } else if (isNaN(idx)) {
                    errEmbed.setDescription('The url index must be a number and not a string or array')
                    return interaction.reply({ embeds: [errEmbed], ephemeral: true })
                }

                if (!newChannel) {
                    errEmbed.setDescription('Must select a channel you want new feeds to be sent.')
                    return interaction.reply({ embeds: [errEmbed], ephemeral: true })
                }
                if (!getFeed.feeds[idx]) {
                    errEmbed.setDescription('That url index does not exist. Please use the "g!rss list" to check you url indexes')
                    return interaction.reply({ embeds: [errEmbed], ephemeral: true })
                }

                await redis.json.arrPop(`rssGuilds_:${interaction.guildId}:feedList`, `$.feeds`, feedIndex)
                await redis.json.arrAppend(`rssGuilds_:${interaction.guildId}:feedList`, '$.feeds', { url: getFeed.feeds[idx].url, channel: newChannel.id, feedsReceived: getFeed.feeds[idx].feedsReceived });
                interaction.reply(`Successfully update rss channel to ${newChannel}`)
                break;
        }
    },
};
