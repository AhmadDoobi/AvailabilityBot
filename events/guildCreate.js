const { Events } = require('discord.js');
const jsonFile = "./servers_info.json";
const fs = require("node:fs");

module.exports = {
    name: Events.GuildCreate,
	once: true,
	execute(guild) {
        // Get the server ID
        const serverId = guild.id;
  
        // Read the JSON file
        const jsonData = JSON.parse(fs.readFileSync(jsonFile));
  
        // Add the server ID to the JSON file
        jsonData[serverId] = {};
  
        // Write the JSON file
        fs.writeFileSync(jsonFile, JSON.stringify(jsonData));
    }
}