const { Client, Events, GatewayIntentBits } = require('discord.js');

require('dotenv').config();

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
]});

client.once(Events.ClientReady, c => {
	console.log(`your bot is online! Logged in as ${c.user.tag}`);
});









client.login(process.env.TOKEN);