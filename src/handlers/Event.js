const { Client, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');

module.exports = (client) => {
    let eventsDir = join(__dirname, "../events")

    readdirSync(eventsDir).forEach(file => {
        if (!file.endsWith(".js")) return;
        let event = require(`${eventsDir}/${file}`)
        event.once ? client.once(event.name, (...args) => event.execute(...args)) : client.on(event.name, (...args) => event.execute(...args))
        client.logger.info(`🌠 Successfully loaded event ${event.name}`)
    })
}
