const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const { loadCommands } = require('../../Handlers/command-handler')
const {  } = require('../../Handlers/reload-teams-games-commands')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload-commands')
		.setDescription('Reloads all commands, commands including team choices, or commands including games choices.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand => 
			subcommand 
				.setName('all-commands')
				.setDescription('reload all commands'))
		.addSubcommand(subcommand => 
			subcommand 
				.setName('teams-commands')
				.setDescription('reload commands that include teams choices'))
		.addSubcommand(subcommand => 
			subcommand 
				.setName('games-commands')
				.setDescription('reload commands that include games choices')),
		async execute(interaction, client) {
			await interaction.reply({
				content: 'processing...',
				ephemeral: true
			})

			const subcommand = interaction.options.getSubcommand();


			if (subcommand === 'all-commands'){
				const startup = false
				const state = await loadCommands(client, startup)
				await interaction.editReply({
					content: state,
					ephemeral: true
				})
			}
		}
}