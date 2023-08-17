module.exports = {
    name: "interactionCreate",
    execute(interaction, client ) {
        if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		command.execute(interaction, client);
    }
}