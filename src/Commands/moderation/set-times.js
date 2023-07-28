const { SlashCommandBuilder } = require("discord.js");
const fs = require('fs');
let teamsFile = fs.readFileSync('teams.json');
let teams = JSON.parse(teamsFile);
const games = fs.readFileSync('games.json', 'utf8');
const gameChoices = JSON.parse(games);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-times')
        .setDescription('register the days and times you want to add for your team members')
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
                .addChoices(...gameChoices)
                .setRequired(true))
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('the channel for the times messages to be sent in')
                .setRequired(true))
};