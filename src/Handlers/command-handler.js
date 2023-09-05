const { loadFiles } = require("../Functions/files-loader");
const ascii = require("ascii-table");
const path = require('node:path');
const dotenv = require("dotenv");
dotenv.config();
const adminGuildId = process.env.ADMIN_GUILD_ID;

async function loadCommands(client, startup) {
    let state;
    const table = new ascii().setHeading("commands", "type", "status");


    await client.commands.clear();
    
    let globalCommandsArray = [];
    let adminCommandsArray = [];

    const files = await loadFiles("Commands");

    files.forEach((file) => {
        const command = require(file);
        if(!command.data){
            console.log(`❌❌❌ There is no data in file: ${file}!`);
            state += `❌❌❌ There is no data in command: ${command}!\n`
            return state;
        };
        
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
        const guild = client.guilds.cache.get(adminGuildId);
        guild.commands.set(adminCommandsArray);

        state += 'rest of the commands successfully reloaded!'
    } else {
        state += "didn't reload any command "
    }

    if (startup){
        console.log(table.toString(), "\nCommands Loaded")
        state = "";
        return
    } else {
        console.log(table.toString(), "\nCommands Reloaded")
        return state
    }
}

module.exports = { loadCommands };