const { loadCommands } = require("../../Handlers/command-handler")
const { cacheMessages } = require('../../Functions/cache-messages')
module.exports = {
	name: "ready",
	once: true,
	async execute(client) {
		console.log(`your bot is online!. Logged in as ${client.user.tag}`);
		const startup = true 
		await loadCommands(client, startup);
		await cacheMessages(client);
	},
};
