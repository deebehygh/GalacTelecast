const { ShardingManager } = require('discord.js');
const bot = require('./app');

const manager = new ShardingManager(bot, { token: bot.config.discord.bot_token });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();