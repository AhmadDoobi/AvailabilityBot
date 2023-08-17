const { teamsCommandsFiles } = require("../Functions/teams-commands-loader");
const { gamesCommandsFiles } = require('../Functions/games-commands-loader');
const ascii = require("ascii-table");
const path = require('node:path');
const dotenv = require("dotenv");
dotenv.config();
const adminGuildId = process.env.ADMIN_GUILD_ID;

async function reloadTeamsAndGamesCommands(client, insideCommand, gamesCommands) {
    let state = "";
    const table = new ascii().setHeading("commands", "type", "status");

    // Admin guild ID
    const adminGuild = client.guilds.cache.get(adminGuildId);

    // Delete Commands
    for (const [commandName, command] of client.commands.entries()) {
        if (gamesCommands ? 
            (command.category === 'BotAdmin' && ['delete-team', 'games-file'].includes(commandName)) ||
            ['Moderation', 'MatchSetup', 'TeamsInfo'].includes(command.category) :
            (command.category === 'BotAdmin' && commandName === 'delete-team') ||
            ['TeamsInfo', 'MatchSetup'].includes(command.category)) {

            // Delete from bot's internal collection
            client.commands.delete(commandName);

            // Delete from Discord API (global or admin guild)
            if (command.category === 'BotAdmin') {
                await adminGuild.commands.cache.get(command.id)?.delete();
            } else {
                await client.application.commands.cache.get(command.id)?.delete();
            }
        }
    }

    // Load Command Files
    const files = gamesCommands ? await gamesCommandsFiles("Commands") : await teamsCommandsFiles(client);

    files.forEach((file) => {
        const command = require(file);
        if (!command.data || !command.execute) {
            console.log(`❌ Missing data or execute in file: ${file}!`);
            return; // Skip this file
        }
        const folder = path.basename(path.dirname(file));
        command.category = folder;
    
        // Add to bot's internal collection
        client.commands.set(command.data.name, command);
    
        // Add to Discord API (global or admin guild)
        if (file.includes('BotAdmin')) {
            adminGuild.commands.create(command.data.toJSON());
            table.addRow(command.data.name, "Admin", "✅");
        } else {
            client.application.commands.create(command.data.toJSON());
            table.addRow(command.data.name, "Global", "✅");
        }
    });
    

    state += 'Commands successfully reloaded!';

    if (insideCommand) {
        return console.log(table.toString(), "\nCommands Reloaded");
    } else {
        console.log(table.toString(), "\nCommands Reloaded");
        return state;
    }
}


module.exports = { reloadTeamsAndGamesCommands };
