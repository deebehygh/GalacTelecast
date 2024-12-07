const { ActivityType } = require('discord.js');
const Config = require('../config.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        let status = ``
        Config.inDev ? status = ` | Parsers Offline` : status = `${client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c)} users`
        await client.user.setActivity(status, { type: Config.inDev ? ActivityType.Playing : ActivityType.Listening });

        client.logger.info(`Logged In as [${client.user.tag}]`)
    }
}