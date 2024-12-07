// @ts-check
const { EmbedBuilder, ActivityType, ButtonBuilder, ButtonStyle, ActionRowBuilder, Client } = require('discord.js');
const { isValidURL, to } = require('./ExtFunctions.js');
const { ExtClient } = require('./ExtClient.js');
const { setInterval } = require('node:timers');

const Config = require('../config.js');
const Parser = require("rss-parser");
const stripTags = require("striptags");

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

    total_feeds_sent = async () => {
        let TSF = this.client.redis.get('totalFeedsSent');
        if (TSF === null || !TSF) this.client.redis.set('totalFeedsSent', 1)
        else this.client.redis.incrBy('totalFeedsSent', 1);
    }

    log_feed_data = async (guildId, newData, idx) => {
        let [feedDataErr, feedData] = await to(this.client.redis.json.get(`rssGuilds_:${guildId}:feeds`));
        let [fdsErr, fds] = await to(this.client.redis.json.get(`rssGuilds_:${guildId}:feedList`));
        if (feedDataErr) this.client.logger.error(feedDataErr);
        else if (fdsErr) this.client.logger.error(fdsErr);

        if (!feedData) {
            await this.client.redis.json.set(`rssGuilds_:${guildId}:feeds`, `$`, [{ title: newData.items[0].title, link: newData.items[0].link, pub: newData.items[0].pubDate, content: newData.items[0].content }])
        } else {
            await this.client.redis.json.arrAppend(`rssGuilds_:${guildId}:feeds`, `$`, { title: newData.items[0].title, link: newData.items[0].link, pub: newData.items[0].pubDate, content: newData.items[0].content });
            await this.client.redis.json.numIncrBy(`rssGuilds_:${guildId}:feedList`, `$.feeds[${idx}].feedsReceived`, 1);
        }
    }

    makeEmbeds = async (newFeed, channel) => {
        let actionRow = new ActionRowBuilder();
        let newButton = new ButtonBuilder().setLabel(await this.truncateString(newFeed.items[0].title, 14)).setStyle(ButtonStyle.Link)
        let rssEmbed = new EmbedBuilder().setTitle(newFeed?.title).setColor(0x753cf0).setTimestamp()
        let regex = /(?:http).+(?::\/\/).+\..+/g;
        channel = this.client.channels?.cache.get(channel);
        if (newFeed.image.url && newFeed.image.url.match(regex)) rssEmbed.setImage(newFeed.image.url)
        else if (newFeed.image.link && newFeed.image.link.match(regex)) rssEmbed.setImage(newFeed.image.link)
        if (newFeed.link.match(regex) && newFeed.link) rssEmbed.setURL(newFeed.link)

        rssEmbed.addFields({
            name: `${newFeed.items[0].title}`,
            value: `*${stripTags(newFeed.items[0].content)}*`
        })
        //actionRow.addComponents(newButton);
        channel?.send({ embeds: [rssEmbed] });
    }

    fetch_feeds = async (/**@type {any}*/ guildId) => {
        let online = await this.client.redis.hGet(`rssGuilds_:${guildId}:feedSettings`, 'online');
        let feed_list = await this.client.redis.json.get(`rssGuilds_:${guildId}:feedList`);

        if (!Boolean(online) || online === 'false') return;
        if (Object.entries(feed_list["feeds"]).length <= 0) return;
        try {
            for (let [id, fds] of Object.entries(feed_list["feeds"])) {
                let [newFeedErr, newFeed] = await to(this.parseURL(fds.url));
                let [itEqualsErr, itEquals] = await to(this.data_exists(guildId, newFeed, id));

                if (itEquals) return await this.client.logger.event(`[${guildId}] No New Feeds`);
                await this.makeEmbeds(newFeed, fds.channel);
                await this.log_feed_data(guildId, newFeed, id);
                await this.total_feeds_sent();
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
            if (!Config.inDev) 
                setInterval(this.fetch_feeds, 1000 * 60 * Number(timerr), guild);
            else
                setInterval(this.fetch_feeds, 1000 * 60 * Number(timerr), '721160858624851968');
        }
    }
}



module.exports = { ExtRss }

