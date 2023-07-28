const { SlashCommandBuilder } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_times')
        .setDescription('register the days and times you want to add for your team members')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('game_name')
                .setDescription('enter the game name')
                .addChoices(
                    
                )
                .setRequired(true))
                
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('the channel for the times messages to be sent in')
                .setRequired(true))
};