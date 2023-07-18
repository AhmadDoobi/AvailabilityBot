const { Events } = require('discord.js');
const jsonFile = "./servers_info.json";
const fs = require("node:fs");


module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`your bot is online! Logged in as ${client.user.tag}`);
        // Get the list of servers the bot is in
        const servers = client.guilds.cache.map((guild) => guild.id);

        // Read the JSON file
        const jsonData = JSON.parse(fs.readFileSync(jsonFile));

        // Add the server IDs that are not in the JSON file
        for (const serverId of servers) {
        if (!jsonData.hasOwnProperty(serverId)) {
            jsonData[serverId] = {};
        }
        }
        // Write the JSON file
        fs.writeFileSync(jsonFile, JSON.stringify(jsonData));
	},
};
