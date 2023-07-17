const dotenv = require("dotenv");
dotenv.config();
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const fs = require("node:fs");
const path = require('node:path');
const jsonFile = "./servers_info.json";
const token = process.env.TOKEN;

// set the intetns for the bot
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageTyping,
]});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

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

client.on(Events.InteractionCreate, interaction => {
	if (!interaction.isChatInputCommand()) return;
});
  
// running the bot
client.login(token);