const { EmbedBuilder, ActivityType, ButtonBuilder, ButtonStyle, ActionRowBuilder, Client } = require('discord.js');
const { updateFeeds, totalFeedsSend, getOnlineStatus, getFeedsList } = require('./ExtRedis.js');
const { isValidURL, to } = require('./ExtFunctions.js');
const { ExtClient } = require('./ExtClient.js');
const { setInterval } = require('node:timers');

const Parser = require("rss-parser");
const stripTags = require("striptags");
const config = require('../config/config.js');


class ExtRss extends Parser {
    constructor(/**@type {ExtClient}*/ client) {
        super({ requestOptions: { rejectUnauthorized: false } })

        this.client = client;
        this.start();
    }

    truncateString = async (/**@type {String}*/ str, /**@type {number}*/ num) => {
        if (str.length <= num) return str
        return str.slice(0, num) + '...'
    }

    data_contains = async(arr, key, val)=> {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i][key] === val) return true;
        }
        return false;
    }

    data_exists = async (guildId, newData, idx) => {
        let feedData = await this.client.redis.json.get(`rssGuilds_:${guildId}:feeds`);
        if (!feedData) return;
        return this.data_contains(feedData, 'title', `${newData['items'][0]['title']}`);
    }

    log_feed_data = async (guildId, newData, idx) => {
        let [feedDataErr, feedData] = await to(this.client.redis.json.get(`rssGuilds_:${guildId}:feeds`));
        let [fdsErr, fds] = await getFeedsList(guildId);
        if (feedDataErr) this.client.logger.error(feedDataErr);
        else if (fdsErr) this.client.logger.error(fdsErr);

        await updateFeeds(feedData, guildId, newData, idx);
    }

    makeEmbeds = async (newFeed, channel) => {
        let actionRow = new ActionRowBuilder();
        let newButton = new ButtonBuilder().setLabel(await this.truncateString(newFeed.items[0].title, 14)).setStyle(ButtonStyle.Link)
        let rssEmbed = new EmbedBuilder().setTitle(newFeed?.title).setColor(0x753cf0).setTimestamp()
        let regex = /(?:http).+(?::\/\/).+\..+/g;
        channel = this.client.channels?.cache.get(channel);
        //if (newFeed.image.url && newFeed.image.url.match(regex)) rssEmbed.setImage(newFeed.image.url)
        //else if (newFeed.image.link && newFeed.image.link.match(regex)) rssEmbed.setImage(newFeed.image.link)
        if (newFeed.link.match(regex) && newFeed.link) rssEmbed.setURL(newFeed.link)

        rssEmbed.addFields({
            name: `${newFeed.items[0].title}`,
            value: `*${stripTags(newFeed.items[0].content)}*`
        })
       // actionRow.addComponents(newButton);
        channel?.send({ embeds: [rssEmbed] });
    }

    fetch_feeds = async (/**@type {any}*/ guildId) => {
        let online = await getOnlineStatus(guildId);
        let feed_list = await getFeedsList(guildId);

        if (!Boolean(online) || online === 'false') return;
        if (Object.entries(feed_list["feeds"]).length <= 0) return;
        try {
            for (let [id, fds] of Object.entries(feed_list["feeds"])) {
                let newFeed = await this.parseURL(fds.url);
                let itEquals = await this.data_exists(guildId, newFeed, id);

                if (itEquals) return await this.client.logger.event(`[${guildId}] No New Feeds`);
                await this.makeEmbeds(newFeed, fds.channel);
                await this.log_feed_data(guildId, newFeed, id);
                await totalFeedsSend();
            }
        } catch (error) {
            let uriErr = new EmbedBuilder().setDescription(`${error}`).setColor('Red').setTimestamp().setFooter({ text: `Rss Error • ${guildId}` })
            await this.client.webhookClient.send({ username: `${guildId} Error`, embeds: [uriErr] });
            console.error(error);
        }
    }

    start = async () => {
        let guilds = await this.client.redis.sMembers('rssGuilds_:gList_');
        if (guilds.length <= 0) return;
        for (let guild of guilds) {
            let timerr = await this.client.redis.hGet(`rssGuilds_:${guild}:feedSettings`, `timer`);
            if (!config.indev) 
                setInterval(this.fetch_feeds, 1000 * 60 * Number(timerr), guild);
            else
                setInterval(this.fetch_feeds, 1000 * 60 * Number(timerr), '721160858624851968');
        }
    }
}



module.exports = { ExtRss }

