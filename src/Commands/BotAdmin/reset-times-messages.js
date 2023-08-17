const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { scheduleMessagesForTeams } = require('../../Functions/new-messages')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-times-messages')
        .setDescription('reset all the teams times messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client){
        await interaction.reply({
            content: 'processing...',
            ephemeral: true
        })
        await scheduleMessagesForTeams(client);
        await interaction.editReply({
            content: 'reseted all times messages!',
            ephemeral: true
        })
    }
}