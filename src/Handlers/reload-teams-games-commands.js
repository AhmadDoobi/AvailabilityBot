const { teamsCommandsFiles } = require("../Functions/teams-commands-loader");
const { gamesCommandsFiles } = require('../Functions/games-commands-loader')
const ascii = require("ascii-table");
const path = require('node:path');

async function reloadTeamsAndGamesCommands(client, insideCommand, gamesCommands) {
    let state;
    let files;
    const table = new ascii().setHeading("commands", "type", "status");
    if (gamesCommands){
        for (const [commandName, command] of client.commands.entries()) {
            if (command.category === 'BotAdmin' && commandName === 'delete-team' || command.category === 'BotAdmin' && commandName === 'games-file') {
                client.commands.delete(commandName);
            }
            else if(command.category !== 'BotAdmin') {
                client.commands.delete(commandName);
            }
        }
        files = await gamesCommandsFiles("Commands")
    } else if (!gamesCommands){
        for (const [commandName, command] of client.commands.entries()){
            if (command.category === 'BotAdmin' && commandName === 'delete-team'){
                client.commands.delete(commandName);
            } else if (command.category === 'Moderation' || command.category === 'Help') {
                client.commands.delete(commandName);
            }
        }
        files = await teamsCommandsFiles("Commands");
    }

    let globalCommandsArray = [];
    let adminCommandsArray = [];


    files.forEach((file) => {
        const command = require(file);
        if(!command.data){
            console.log(`❌❌❌ There is no data in file: ${file}!`);
            state += `❌❌❌ There is no data in command: ${command}!\n`
            return state
        };
        const folder = path.basename(path.dirname(file));
        command.category = folder;
        client.commands.set(command.data.name, command);

        if (file.includes('BotAdmin')) {
            if ('data' in command && 'execute' in command && file.includes('delete-team.js') || 'data' in command && 'execute' in command && file.includes('games-file.js')) {
                adminCommandsArray.push(command.data.toJSON());
                table.addRow(command.data.name, "Admin", "✅");
            } else {
                table.addRow(command.data.name, "Admin", "🔴");
                state += `🔴 There is no execute for command: ${command.data.name}!\n`
            }
        } else {
            if ('data' in command && 'execute' in command) {
                globalCommandsArray.push(command.data.toJSON());
                table.addRow(command.data.name, "Global", "✅");
            } else {
                table.addRow(command.data.name, "Global", "🔴");
                state += `🔴 There is no execute for command: ${command.data.name}!\n`
            }
        }
    })

    if (globalCommandsArray || adminCommandsArray){
        // Globally set all non-admin commands
        client.application.commands.set(globalCommandsArray);

        // Set admin commands to the admin guild
        const guildId = '1131204470274019368';
        const guild = client.guilds.cache.get(guildId);
        guild.commands.set(adminCommandsArray);

        state += 'rest of the commands successfully reloaded!';
    } else {
        state += "didn't reload any command!";
    }

    if (insideCommand){
        return console.log(table.toString(), "\nCommands Reloaded")
    } else {
        console.log(table.toString(), "\nCommands Reloaded")
        return state;
    }
}

module.exports = { reloadTeamsAndGamesCommands };