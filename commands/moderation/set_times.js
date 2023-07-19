const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_times')
        .setDescription('register the days and times you want to add for your team members')
};