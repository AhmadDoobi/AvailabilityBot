const dotenv = require("dotenv");
dotenv.config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const token = process.env.TOKEN;
const { loadEvents } = require("./Handlers/event-handler");
const { setupDatabase } = require('./Functions/setup-db')
// set the intetns for the bot
const client = new Client({ intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageTyping,
]});

setupDatabase();

client.events = new Collection();
client.commands = new Collection();

loadEvents(client);

// running the bot
client.login(token);