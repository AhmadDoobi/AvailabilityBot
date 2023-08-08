const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const { loadCommands } = require('../../Handlers/command-handler');
const { reloadTeamsAndGamesCommands } = require('../../Handlers/reload-global-commands');
const { reloadSpecificCommand } = require('../../Handlers/reload-specific-command')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload-commands')
		.setDescription('Reloads a command, global commands, or all commands.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand => 
			subcommand 
				.setName('all-commands')
				.setDescription('reload all commands'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('global-commands')
				.setDescription('reload all games and teams commands'))
		.addSubcommandGroup(subcommandgroup =>
			subcommandgroup
				.setName('specific')
				.setDescription('reload a specific command')
				.addSubcommand(subcommand =>
					subcommand
						.setName('bot_admin')
						.setDescription('BotAdmin category')
						.addStringOption(option =>
							option 
								.setName('command-name')
								.setDescription('select the command name')
								.setRequired(true)
								.addChoices(
									{name: 'delete-team', value: 'delete-team'},
									{name: 'games-file', value: 'games-file'},
									{name: 'reload-commands', value: 'reload-commands'},
								)
						)
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('help')
						.setDescription('Help category')
						.addStringOption(option =>
							option 
								.setName('command-name')
								.setDescription('select the command name')
								.setRequired(true)
								.addChoices(
									{name: 'help', value: 'help'},
								)
						)
				
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('match_setup')
						.setDescription('MatchSetup category')
						.addStringOption(option =>
							option 
								.setName('command-name')
								.setDescription('select the command name')
								.setRequired(true)
								.addChoices(
									{name: 'match-setup', value: 'match-setup'},
								)			
						)
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('moderation')
						.setDescription('Moderation category')
						.addStringOption(option =>
							option 
								.setName('command-name')
								.setDescription('select the command name')
								.setRequired(true)
								.addChoices(
									{name: 'register-team', value: 'register-team'},
									{name: 'reset-team-info', value: 'reset-team-info'},
									{name: 'set-times', value: 'set-times'},
									{name: 'reset-times', value: 'reset-times'},
								)			
						)
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('teams_info')
						.setDescription('TeamsInfo category')
						.addStringOption(option =>
							option 
								.setName('command-name')
								.setDescription('select the command name')
								.setRequired(true)
								.addChoices(
									{name: 'get-team-info', value: 'get-team-info'},
									{name: 'get-teams-availability', value: 'get-teams-availability'},
								)			
						)
				)
			),
		async execute(interaction, client) {
			await interaction.reply({
				content: 'processing...',
				ephemeral: true
			})
			const subcommand = interaction.options.getSubcommand();
			if (interaction.options.getSubcommandGroup()){
				const commandName = interaction.options.getString('command-name');
				try {
					const state = await reloadSpecificCommand(subcommand, commandName, client)
					await interaction.editReply({
						content: state,
						ephemeral: true
					})
				} catch (error){
					console.log(error)
					await interaction.editReply({
						content: 'something went wrong. please try again',
						ephemeral: true
					})
					return;
				}
				return;
			}

			switch (subcommand) {
				case 'all-commands': {
					try{
						const startup = false
						const state = await loadCommands(client, startup)
						await interaction.editReply({
							content: state,
							ephemeral: true
						})
					} catch (error){
						console.log(error)
						const state = await interaction.editReply({
							content: state,
							ephemeral: true
						})
						return;
					}
				}
				return;

				case 'global-commands': {
					try{
						const insideCommand = false;
						const state = await reloadTeamsAndGamesCommands(client, insideCommand) 
						await interaction.editReply({
							content: state,
							ephemeral: true 
						})
					} catch(error){
						console.log(error)
						await interaction.editReply({
							content: 'something went wrong. please try again',
							ephemeral: true
						})
					}
				}
				return;
			}
		}
}