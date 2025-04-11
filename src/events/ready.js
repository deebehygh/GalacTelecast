const { ActivityType } = require('discord.js');
const config = require('../config/config');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        let status = ``
        config.indev ? status = ` | Parsers Offline` : status = `${client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c)} users`
        await client.user.setActivity(status, { type: config.indev ? ActivityType.Playing : ActivityType.Listening });

        client.logger.info(`Logged In as [${client.user.tag}]`)
    }
}