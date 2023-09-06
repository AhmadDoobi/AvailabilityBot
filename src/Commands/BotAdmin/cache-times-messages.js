const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { cacheMessages } = require('../../Functions/cache-messages');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cache-times-messages')
        .setDescription('cache the times messages to get reactions')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client){
        await interaction.reply({
            content: 'processing...',
            ephemeral: true
        })
        try {
            await cacheMessages(client);
            await interaction.editReply({
                content: 'Successfully cached all times messages ',
                ephemeral: true
            })
            return;
        } catch (error) {
            console.log(`something went wrong while caching times messages on command: ${error}`)
            await interaction.editReply({
                content: 'something went wrong',
                ephemeral: true
            })
        }
    }
}