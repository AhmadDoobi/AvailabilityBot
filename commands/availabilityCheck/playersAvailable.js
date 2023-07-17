const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('players_available')
        .setDescription('displays the players who are available on your team on a specific day')
};