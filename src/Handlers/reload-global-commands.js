const { globalCommandsFiles } = require("../Functions/global-commands-loader");
const ascii = require("ascii-table");
const path = require('node:path');

async function reloadTeamsAndGamesCommands(client) {
    const table = new ascii().setHeading("commands", "type", "status");

    for (const [commandName, command] of client.commands.entries()) {
        if (command.category === 'BotAdmin' && commandName === 'delete-team' || command.category === 'BotAdmin' && commandName === 'games-file') {
            client.commands.delete(commandName);
        }
        else if(command.category !== 'BotAdmin') {
            client.commands.delete(commandName);
        }
    }

    let globalCommandsArray = [];
    let adminCommandsArray = [];

    const files = await globalCommandsFiles("Commands");

    files.forEach((file) => {
        const command = require(file);
        if(!command.data){
            console.log(`❌❌❌ There is no data in file: ${file}!`);
            return;
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
            }
        } else {
            if ('data' in command && 'execute' in command) {
                globalCommandsArray.push(command.data.toJSON());
                table.addRow(command.data.name, "Global", "✅");
            } else {
                table.addRow(command.data.name, "Global", "🔴");
            }
        }
    })

    // Globally set all non-admin commands
    client.application.commands.set(globalCommandsArray);

    // Set admin commands to the admin guild
    const guildId = '1131204470274019368';
    const guild = client.guilds.cache.get(guildId);
    guild.commands.set(adminCommandsArray);

    return console.log(table.toString(), "\nCommands Reloaded")
}

module.exports = { reloadTeamsAndGamesCommands };