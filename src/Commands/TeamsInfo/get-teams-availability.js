const { SlashCommandBuilder } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-team-availability')
        .setDescription('displays teams availability')
};