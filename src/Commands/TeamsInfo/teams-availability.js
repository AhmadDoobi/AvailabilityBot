const { SlashCommandBuilder } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('team-availability')
        .setDescription('displays teams availability')
};