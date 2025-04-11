const { Guild, GuildMember, PermissionFlagsBits, PermissionsBitField, TextChannel, Message, GuildChannel, BaseChannel } = require("discord.js");
const { ExtClient } = require('./ExtClient.js');
const http = require('http');
const https = require('https');

class Logger {

    color = {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        underscore: "\x1b[4m",
        blink: "\x1b[5m",
        reverse: "\x1b[7m",
        hidden: "\x1b[8m",
        fg: {
            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m",
            crimson: "\x1b[38m"
        },
        bg: {
            black: "\x1b[40m",
            red: "\x1b[41m",
            green: "\x1b[42m",
            yellow: "\x1b[43m",
            blue: "\x1b[44m",
            magenta: "\x1b[45m",
            cyan: "\x1b[46m",
            white: "\x1b[47m",
            crimson: "\x1b[48m"
        }
    }
    date_time = new Date();
    date = ("0" + this.date_time.getDate()).slice(-2);
    month = ("0" + (this.date_time.getMonth() + 1)).slice(-2);
    year = this.date_time.getFullYear();
    hours = this.date_time.getHours();
    minutes = this.date_time.getMinutes();
    seconds = this.date_time.getSeconds();
    time = `[${this.year}/${this.month}/${this.date} | ${this.hours}:${this.minutes}:${this.seconds}]`;

    /**
     * @param {string} text
     */
    async event(text) {
        console.log(`${this.color.fg.magenta}%s${this.color.reset}`, `${this.time} ${text}`);
    }

    /**
     * @param {string} text
     */
    async info(text) {
        console.log(`${this.color.fg.green}%s${this.color.reset}`, `${this.time} ${text}`);
    }

    /**
     * @param {any} text
     */
    async error(text) {
        console.log(`${this.color.fg.red}%s${this.color.reset}`, `${this.time} ${text}`);
    }

    /**
     * @param {any} text
     */
    async on_command_used(text) {
        console.log(`${this.color.fg.crimson}%s${this.color.reset}`, `${this.time} ${text}`);
    }
}

const checkPermissions = (/** @type {{ permissions: { has: (arg0: any) => any; }; }} */ member, /** @type {any[]} */ permissions) => {
    let neededPermissions = []
    permissions.forEach((/** @type {any} */ permission) => {
        if (!member.permissions.has(permission)) neededPermissions.push(permission)
    })
    if (neededPermissions.length === 0) return null
    return neededPermissions.map(p => {
        if (typeof p === "string") return p.split(/(?=[A-Z])/).join(" ")
        else return Object.keys(PermissionFlagsBits).find(k => Object(PermissionFlagsBits)[k] === p)?.split(/(?=[A-Z])/).join(" ");
    })
};

const sendTimedMessage = (/** @type {any} */ message, /** @type {Message} */ channel,  /**@type {Number}*/ duration) => {
    return channel?.reply(message)
        .then((/** @type {any} */ m) => setTimeout(async () => (await channel?.messages.fetch(m)).delete(), duration))
};

const isValidURL = (/** @type {String}*/ string) => {
    let res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
}

const create_guild_keys = async (client, /** @type {any}*/ guild) => {
    let rssGuilds = await client.redis.sIsMember('rssGuilds_:gList_', guild);

    try {
        if (!rssGuilds) {
            await client.redis.sAdd('rssGuilds_:gList_', guild);
            await client.redis.hSet(`rssGuilds_:${guild}.feedSettings`, { online: "false" })
            await client.redis.hSet(`rssGuilds_:${guild}.feedSettings`, { timer: "60" })
            await client.redis.hSet(`rssGuilds_:${guild}.feedSettings`, { totalFeedsSent: "0" })
        } else { client.logger.error('This guild already exists in the rss database') }
    } catch (error) {
        console.error(error);
    }


    await client.logger.info('Created new keys for: ' + guild);
}

const delete_guild_keys = async (client, /** @type {any}*/ guild) => {
    const keys = [`rssGuilds_:${guild}.feedList`, `rssGuilds_:${guild}.feedSettings`, `rssGuilds_:${guild}.recordedGames`, `rssGuilds_:${guild}.freeEpicGamesSettings`];
    await client.redis.sRem('rssGuilds_:gList_', guild);
    await client.redis.del(keys)
    await client.logger.info('Removed keys for: ' + guild);
}

const update_guild_database = async (client, /** @type {any}*/ guild) => {
    await create_guild_keys(client, guild); //Needs to be updated. This just creates a new db key/folder for a guild
}

const website_status = (/** @type {any} */ url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => { resolve(res.statusCode === 200); }).on("error", (e) => {
            resolve(false);
        });
    })
}

const to = (/** @type {any} */ promise) => {
    return promise
        .then((/** @type {any} */ data) => [null, data])
        .catch((/** @type {any} */ err) => [err]);
}

module.exports = {
    Logger,
    to,
    checkPermissions,
    sendTimedMessage,
    isValidURL,
    create_guild_keys,
    delete_guild_keys,
    update_guild_database,
    website_status
}