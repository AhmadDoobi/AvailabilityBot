const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { scheduleMessagesForTeams } = require('../../Functions/new-messages');
const { sendLog } = require('../../Functions/bot-log-message');
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
            content: 'Successfully reseted all times messages!',
            ephemeral: true
        })

        const logEmbed = new EmbedBuilder()
            .setDescription('times messages were reseted manually!')
            .setColor('#ffffe9');
        return await sendLog(client, logEmbed);
    }
}