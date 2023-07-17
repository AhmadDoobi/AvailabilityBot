require('dotenv').config();
const { Client, Events, GatewayIntentBits, REST } = require('discord.js');
const fs = require("fs");
const jsonFile = "./servers_info.json";
const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;


// set the intetns for the bot
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
]});

client.once(Events.ClientReady, c => {
	console.log(`your bot is online! Logged in as ${c.user.tag}`);

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
  
});

client.on("guildCreate", (guild) => {
    // Get the server ID
    const serverId = guild.id;
  
    // Read the JSON file
    const jsonData = JSON.parse(fs.readFileSync(jsonFile));
  
    // Add the server ID to the JSON file
    jsonData[serverId] = {};
  
    // Write the JSON file
    fs.writeFileSync(jsonFile, JSON.stringify(jsonData));
});
  
  
// running the bot
client.login(token);