const { Client, Collection, GatewayIntentBits, WebhookClient, ActivityType } = require('discord.js');
const { Logger } = require('./ExtFunctions.js');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');
const { redis } = require('./ExtRedis.js');
const { ExtRss } = require('./ExtRss.js')
const { ExtFreeGames } = require('./ExtFreeGames.js');
const { deployCommands, deleteCommands } = require('../deploy.js');
const config = require('../config/config.js');


class ExtClient extends Client {
    
    commands = new Collection();
    slashCommands = new Collection();
    aliases = new Collection();
    cooldowns = new Collection();
    webhookClient = new WebhookClient({ url: config.webhookUrl });
    logger = new Logger();
    redis = redis;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds, 
                GatewayIntentBits.GuildMessages, 
                GatewayIntentBits.GuildWebhooks, 
                GatewayIntentBits.MessageContent
            ]
        })
    }

    start = async () => {
        //await deleteCommands()
        await deployCommands();
        this.login(config.token).then(() => {
            this.rss = new ExtRss(this);
            this.games = new ExtFreeGames(this);
            
        });
        const handlersDir = join(__dirname, "../handlers");
        readdirSync(handlersDir).forEach(handler => { require(`${handlersDir}/${handler}`)(this) });  
    }
}

module.exports = ExtClient;