const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");


module.exports = {
    dat: new SlashCommandBuilder()
        .setName('reset_team')
        .setDescription('reset team data in the json file')
};