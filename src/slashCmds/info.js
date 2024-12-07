const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Information about Galactic Feeds'),
    async execute(interaction) {
        let totalSeconds = (interaction.client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        let servers = await interaction.client.guilds.cache.size
        let users = await interaction.client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c);

        let feeds = await interaction.client.redis.get('totalFeedsSent')
        const info = new EmbedBuilder()
            .setAuthor({ name: interaction.client.user.tag, iconURL: interaction.client.user.displayAvatarURL() })
            .addFields(
                { name: 'Uptime', value: `${days}d, ${hours}h, ${minutes}m, ${seconds}s` },
                { name: 'Servers', value: `${servers} \xa0`, inline: true },
                { name: 'Users', value: `${users} \xa0`, inline: true },
                { name: 'Feeds Sent', value: `${feeds}`, inline: true },
                { name: 'Library', value: 'Discord.JS', inline: true },
                { name: 'Shards', value: 'N/A', inline: true },
                { name: `Others`, value: '**[Invite Me](https://discord.com/api/oauth2/authorize?client_id=1066571720712015982&permissions=397821471744&scope=bot%20applications.commands) | [Support Server](https://www.discord.gg/vA4gUUUgdS) | [Patreon](https://patreon.com/galacticfeeds)**' }
            )
            .setColor('Aqua')
            .setTimestamp()

        await interaction.reply({ embeds: [info] });

    },
};
