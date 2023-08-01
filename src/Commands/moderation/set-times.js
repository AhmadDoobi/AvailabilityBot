const { SlashCommandBuilder } = require("discord.js");
const fs = require('fs');
let teams = JSON.parse(fs.readFileSync('teams.json', 'utf8')).teams;
const gamesFile = fs.readFileSync('games.json', 'utf8');
const gameChoices = JSON.parse(gamesFile);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-times')
        .setDescription('register the days and times you want to add for your team members to chick their availability in')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('game_name')
                .setDescription('select the game')
                .addChoices(...gameChoices)
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('team')
                .setDescription('select your team')
                .addChoices(...teams)
                .setRequired(true))
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('the channel for the times messages to be sent in')
                .setRequired(true))
};