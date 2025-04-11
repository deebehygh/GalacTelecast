const { EmbedBuilder, Guild, Events } = require('discord.js');
const { create_guild_keys } = require('../ext/ExtFunctions.js');
const { ExtClient } = require('../ext/ExtClient.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(/**@type {Guild}*/ guild) {
        const justJoined = new EmbedBuilder()
            .addFields(
                { name: 'Guild Name', value: `${guild.name} .`, inline: true },
                { name: 'Member Count', value: `${guild.memberCount} users`, inline: true }
            )
            .setColor('Green')
            .setTimestamp();
        await guild.client.webhookClient.send({ username: 'Joined a New Guild', embeds: [justJoined] });
        await create_guild_keys(guild.client, guild.id);
    }
}