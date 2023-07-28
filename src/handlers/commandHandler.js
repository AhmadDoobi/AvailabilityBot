async function loadCommands(client) {
    const { loadFiles } = require("../functions/filesLoader");
    const ascii = require("ascii-table");
    const table = new ascii().setHeading("commands", "status");
    const path = require('node:path');

    await client.commands.clear();
    
    let globalCommandsArray = [];
    let adminCommandsArray = [];

    const files = await loadFiles("commands");

    files.forEach((file) => {
        const command = require(file);
        const folder = path.basename(path.dirname(file));
        command.category = folder;
        client.commands.set(command.data.name, command);

        // Check if command file is in 'botAdmin' directory
        if (file.includes('botAdmin')) {
            adminCommandsArray.push(command.data.toJSON());
            table.addRow(command.data.name, "✅ (Admin)");
        } else {
            globalCommandsArray.push(command.data.toJSON());
            table.addRow(command.data.name, "✅ (Global)");
        }
    })

    // Globally set all non-admin commands
    client.application.commands.set(globalCommandsArray);

    // Set admin commands to a specific guild
    const guildId = '1131204470274019368';
    const guild = client.guilds.cache.get(guildId);
    guild.commands.set(adminCommandsArray);

    return console.log(table.toString(), "\nCommands Loaded")
}

module.exports = { loadCommands };

