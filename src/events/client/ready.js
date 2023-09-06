const { EmbedBuilder } = require('discord.js')
const { loadCommands } = require("../../Handlers/command-handler");
const { cacheMessages } = require('../../Functions/cache-messages');
const { sendLog } = require('../../Functions/bot-log-message');
module.exports = {
	name: "ready",
	once: true,
	async execute(client) {
		console.log(`your bot is online!. Logged in as ${client.user.tag}`);
		const startup = true 
		await loadCommands(client, startup);
		await cacheMessages(client);
		const logEmbed = new EmbedBuilder()
			.setDescription('The bot just came online')
			.setColor('#c5e1a5')
		return await sendLog(client, logEmbed)
	},
};
