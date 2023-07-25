const { SlashCommandBuilder } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_times')
        .setDescription('register the days and times you want to add for your team members')
        .setDMPermission(false)
        .addChannelOption(option =>
            option
            .setName('channel')
            .setDescription('the channel for the times messages to be sent in'))
};