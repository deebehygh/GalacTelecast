//@ts-check
const { Client, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');

module.exports = async (client) => {
    const slashCommands = [];
    const commands = [];

    let slashCommandsDir = join(__dirname,"../slashCmds")
    let commandsDir = join(__dirname,"../cmds")


    readdirSync(slashCommandsDir).forEach(file => {
        if (!file.endsWith(".js")) return;
        let command = require(`${slashCommandsDir}/${file}`)
        slashCommands.push(command)
        client.slashCommands.set(command.data.name, command)
        client.logger.info(`🚀 Successfully loaded slash command ${command.data.name}`)
    })

    readdirSync(commandsDir).forEach(file => {
        if (!file.endsWith(".js")) return;
        let command = require(`${commandsDir}/${file}`)
        commands.push(command)
        client.commands.set(command.name, command)
        client.logger.info(`💩 Successfully loaded command ${command.name}`)
    })

}