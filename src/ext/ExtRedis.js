const { createClient } = require('redis');
const config = require('../config/config');
const redis = createClient({ url: config.redisUrl });

redis.connect();
redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (error) => console.error(error));

totalFeedsSend = async () => {
    let TSF = redis.get('totalFeedsSent');
    if (TSF === null || !TSF) redis.set('totalFeedsSent', 1)
    else redis.incrBy('totalFeedsSent', 1);
}

updateFeeds = async (feedData, guildId, newData, idx) => {
    if (!feedData) {
        await this.client.redis.json.set(`rssGuilds_:${guildId}:feeds`, `$`, [{ title: newData.items[0].title, link: newData.items[0].link, pub: newData.items[0].pubDate, content: newData.items[0].content }])
    } else {
        await this.client.redis.json.arrAppend(`rssGuilds_:${guildId}:feeds`, `$`, { title: newData.items[0].title, link: newData.items[0].link, pub: newData.items[0].pubDate, content: newData.items[0].content });
        await this.client.redis.json.numIncrBy(`rssGuilds_:${guildId}:feedList`, `$.feeds[${idx}].feedsReceived`, 1);
    }
}

getOnlineStatus = async (guildId) => {
    let online = await redis.hGet(`rssGuilds_:${guildId}:rssSettings`, 'online');
    return online;
}

getFeedsList = async (guildId) => {
    let feedList = await redis.json.get(`rssGuilds_:${guildId}:feedList`);
    return feedList;
}

module.exports = { redis, totalFeedsSend, updateFeeds, getOnlineStatus, getFeedsList };