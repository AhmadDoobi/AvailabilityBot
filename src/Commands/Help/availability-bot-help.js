const { SlashCommandBuilder } = require("discord.js");
const { helpEmbed } = require('../../Embeds/availability-bot-help-embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('availability-bot-help')
        .setDescription('helps you learn how to use the bot'),
    
    async execute(interaction) {
        const embed = await helpEmbed();
        await interaction.reply({ embeds: [embed] });
        return;
    }
}