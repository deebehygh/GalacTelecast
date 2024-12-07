//@ts-check
const { Client, REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');

const deployCommands = async () => {
    const commands = [];
        const commandsPath = join(__dirname, 'slashCmds');
        const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = join(commandsPath, file);
            const command = require(filePath);
            commands.push(command.data.toJSON());
        }
        const rest = new REST().setToken(config.discord.bot_token);
        try {
            console.log(`Started refreshing ${commands.length} slash commands...`);
            const data = await rest.put(Routes.applicationCommands(config.discord.client.id), { body: commands },);
            // @ts-ignore
            console.log(`Successfully reloaded ${data.length} slash commands...`);
        } catch (error) {
            console.error(error);
        }
}

const deleteCommands = async () => {
    const commands = [];
        const commandsPath = join(__dirname, 'slashCmds');
        const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = join(commandsPath, file);
            const command = require(filePath);
            commands.push(command.data.toJSON());
        }
        const rest = new REST().setToken(config.discord.bot_token);
        try {
            console.log(`Started refreshing ${commands.length} slash commands...`);
            const data = await rest.put(Routes.applicationCommands(config.discord.client.id), { body: [] },)
            // @ts-ignore
            console.log(`Successfully reloaded ${data.length} slash commands...`);
        } catch (error) {
            console.error(error);
        }
}

module.exports = { deployCommands, deleteCommands }