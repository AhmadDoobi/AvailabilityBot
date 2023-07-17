const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team_availability')
        .setDescription('displays a teams availability')
};