// Load environment variables
const { join } = require("node:path");
require("dotenv").config({ path: join(__dirname, "../../.env") });

const config = {
  prefix: process.env.PREFIX || "!",
  indev: process.env.INDEV === "true", // Convert to boolean
  port: process.env.PORT || 3000,
  domain: process.env.DOMAIN || "localhost",
  redisUrl: process.env.REDIS_URL,
  token: process.env.TOKEN,
  botId: process.env.BOT_ID,
  guildId: process.env.GUILD_ID,
  webhookUrl: process.env.WEBHOOK_URL,
};

module.exports = config;
