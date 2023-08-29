const dotenv = require("dotenv");
dotenv.config();
const readline = require('readline');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const token = process.env.TOKEN;
const { loadEvents } = require("./Handlers/event-handler");
const { setupDatabase } = require('./Functions/setup-db')
const { scheduleMessagesForTeams } = require('./Functions/new-messages.js')

// set the intetns for the bot
const client = new Client({ intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
]});

setupDatabase();

client.events = new Collection();
client.commands = new Collection();

loadEvents(client);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('line', async (input) => {
  if (input.trim() === 'reset times messages') {
    console.log('Starting the reset operation...');
    console.time('ResetOperation');

    try {
      await scheduleMessagesForTeams(client);
      console.timeEnd('ResetOperation');
      console.log('Times messages reset successfully!');
    } catch (error) {
      console.error('An error occurred while resetting times messages:', error);
    }
  }
});


// running the bot
client.login(token);