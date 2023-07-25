const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload_command')
		.setDescription('Reloads a command.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption(option =>
			option
				.setName('command_category')
				.setDescription('the category of the command')
				.setRequired(true)
				.addChoices(
					{name: 'availabilityCheck', value: 'availabilityCheck'},
					{name: 'botAdmin', value: 'botAdmin'},
					{name: 'moderation', value: 'moderation'},
				))
		.addStringOption(option =>
			option
				.setName('command')
				.setDescription('The command to reload.')
				.setRequired(true)
				.addChoices(
					{name: 'set_team', value: 'set_team'},
					{name: 'set_times', value: 'set_times' },
					{name: 'team_availability', value: 'team_availability'},
					{name: 'reset_team', value: 'reset_team'},
					{name: 'reload_command', value: 'reload_command'},
				)),
	async execute(interaction) {
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);
		const commandCategory = interaction.options.getString('command_category');

		if (!command) {
			return interaction.reply(`There is no command with name \`${commandName}\`!`);
		}

		delete require.cache[require.resolve(`../${commandCategory}/${command.data.name}.js`)];

		try {
	        interaction.client.commands.delete(command.data.name);
	        const newCommand = require(`../${commandCategory}/${command.data.name}.js`);
	        interaction.client.commands.set(newCommand.data.name, newCommand);
	        await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
		} catch (error) {
	        console.error(error);
	        await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
		}
	},
};