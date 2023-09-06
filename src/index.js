const dotenv = require("dotenv");
dotenv.config();
const readline = require('readline');
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const token = process.env.TOKEN;
const { loadEvents } = require("./Handlers/event-handler");
const { setupDatabase } = require('./Functions/setup-db')
const { scheduleMessagesForTeams } = require('./Functions/new-messages.js')
const { sendLog } = require('./Functions/bot-log-message');

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
    const logEmbed = new EmbedBuilder()
      .setColor('#7eff80');
    const startTime = Date.now(); 

    try {
      await scheduleMessagesForTeams(client);
      const endTime = Date.now(); 
      const timeTaken = (endTime - startTime) / 1000; 
      logEmbed
        .setDescription('Times messages have been reset!')
        .addFields({name: 'time took for reseting', value: `${timeTaken}s`});

      return await sendLog(client, logEmbed)
    } catch (error) {
      logEmbed.setDescription('An error occurred while resetting times messages: ', error);
      return await sendLog(client, logEmbed);
    }
  }
});


// running the bot
client.login(token);