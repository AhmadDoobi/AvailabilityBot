const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { scheduleMessagesForTeams } = require('../../Functions/new-messages');
const { sendLog } = require('../../Functions/bot-log-message');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-times-messages')
        .setDescription('reset all the teams times messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction, client){
        // Ask for confirmation
        await interaction.reply({
            content: 'Are you sure you want to reset the times messages? (yes/no)',
            ephemeral: true
        });

        // Listen for user's response
        const filter = m => m.author.id === interaction.user.id;
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 40000, errors: ['time'] })
            .catch(() => {
                interaction.followUp({
                    content: 'You did not respond in time. Abandoning operation.',
                    ephemeral: true
                });
                return;
            });

        if (!collected || collected.first().content.toLowerCase() === 'no') {
            await interaction.followUp({
                content: 'Operation canceled.',
                ephemeral: true
            });
            return;
        }

        if (collected.first().content.toLowerCase() === 'yes') {
            await interaction.followUp({
                content: 'Processing...',
                ephemeral: true
            });

            // Start the timer
            const startTime = Date.now();

            // Perform the operation
            await scheduleMessagesForTeams(client);

            // Stop the timer
            const endTime = Date.now();

            // Calculate the time taken in seconds
            const timeTaken = (endTime - startTime) / 1000;

            await interaction.followUp({
                content: `Successfully reset all times messages! Time taken: ${timeTaken.toFixed(2)} seconds`,
                ephemeral: true
            });

            const logEmbed = new EmbedBuilder()
                .setDescription('Times messages were reset manually!')
                .setColor('#ffffe9')
                .addFields({
                    name: 'Time Taken',
                    value: `${timeTaken.toFixed(2)} seconds`
                });

            await sendLog(client, logEmbed);
        }

        return;
    }
};
