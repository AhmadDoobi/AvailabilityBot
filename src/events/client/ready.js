const { loadCommands } = require("../../handlers/commandHandler")

module.exports = {
	name: "ready",
	once: true,
	execute(client) {
		console.log(`your bot is online!. Logged in as ${client.user.tag}`);

		loadCommands(client);
	},
};
