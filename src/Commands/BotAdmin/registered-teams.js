const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { registeredTeamsEmbed } = require('../../Embeds/registered-teams-embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('registered-teams')
        .setDescription('displayes all the registered teams and basic info')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const embed = await registeredTeamsEmbed(client);
        await interaction.reply({ embeds: [embed] });
        return;
    }
}