const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { botGuildsEmbed } = require('../../Embeds/bot-guilds-embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-guilds')
        .setDescription('displayes all the servers the bot is in')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const embed = await botGuildsEmbed(client);
        await interaction.reply({ embeds: [embed] });
        return;
    }
}