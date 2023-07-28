const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-team')
        .setDescription('reset team data in the json file')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
};