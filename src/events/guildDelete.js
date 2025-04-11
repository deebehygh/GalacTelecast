const { EmbedBuilder, Guild, Events } = require('discord.js');
const { delete_guild_keys } = require('../ext/ExtFunctions.js');
const { ExtClient } = require('../ext/ExtClient.js');

module.exports = {
    name: Events.GuildDelete,
    async execute(/**@type {Guild}*/ guild) {
        const justJoined = new EmbedBuilder()
            .addFields({ name: 'Guild Name', value: `${guild.name} .`, inline: true }, { name: 'Member Count', value: `${guild.memberCount} users`, inline: true })
            .setColor('Red')
            .setTimestamp();
        await guild.client.webhookClient.send({ username: 'Left a Guild', embeds: [justJoined] });
        await delete_guild_keys(guild.client, guild.id);
    }
}