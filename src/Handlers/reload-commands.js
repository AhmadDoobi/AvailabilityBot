
async function reloadTeamsAndGamesCommands(client) {
    
    const { globalCommandsFiles } = require("../Functions/global-commands-loader");
    const ascii = require("ascii-table");
    const table = new ascii().setHeading("commands", "type", "status");
    const path = require('node:path');

    for (const [commandName, command] of client.commands.entries()) {
        if (command.category === 'BotAdmin' && commandName === 'reset-teams') {
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
        const folder = path.basename(path.dirname(file));
        command.category = folder;
        client.commands.set(command.data.name, command);

        // Check if command file is in 'botAdmin' directory
        if (file.includes('BotAdmin')) {
            if ('data' in command && 'execute' in command) {
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