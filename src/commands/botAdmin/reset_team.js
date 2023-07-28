const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset_team')
        .setDescription('reset team data in the json file')
};