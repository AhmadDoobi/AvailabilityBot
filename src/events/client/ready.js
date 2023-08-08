const { loadCommands } = require("../../Handlers/command-handler")

module.exports = {
	name: "ready",
	once: true,
	execute(client) {
		console.log(`your bot is online!. Logged in as ${client.user.tag}`);
		const startup = true 
		loadCommands(client, startup);
	},
};
