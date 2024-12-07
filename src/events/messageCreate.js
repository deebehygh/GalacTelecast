//@ts-check
const { ChannelType, Message, Events, EmbedBuilder } = require('discord.js')
const { Logger, sendTimedMessage, checkPermissions } = require('../ext/ExtFunctions.js');
const Config = require('../config.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        let prefix = Config.prefix;
        if (message.author.bot) return;
        if (message.channel.type === ChannelType.DM) return;

        if (!Config.db.ownerIDs.includes(message.author.id))
				return message.reply({ content: 'Currently in maintenance. All services and commands disabled.', ephemeral: true})

        if (!message.content.startsWith(prefix)) return;
        let args = message.content.slice(prefix.length).trim().split(/ +/g);
        let commandInput = args.shift().toLowerCase();
        if (!commandInput.length) return;

        let command = message.client.commands.get(commandInput);
        if (!command) {
            let commandFromAlias = message.client.commands.find((command) => command.aliases.includes(commandInput))
            if (commandFromAlias) command = commandFromAlias
            else return;
        }

        command.execute(message.client, message, args);
        message.client.logger.on_command_used(`[${message.guildId}] (${message.channel.name}) ${message.author.username} used /${command}`)
        
    }
}