const { SlashCommandBuilder } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('team_info')
        .setDescription('displays a team captain and co-captain usernames')
};