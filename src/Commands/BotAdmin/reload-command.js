const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload-commands')
		.setDescription('Reloads a command, or all commands.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
}